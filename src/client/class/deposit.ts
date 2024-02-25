import { now, sleep }       from '@/lib/util.js'
import { validate_deposit } from '@/validators/deposit.js'
import { EscrowClient }     from './client.js'
import { EventEmitter }     from './emitter.js'
import { EscrowSigner }     from './signer.js'

import {
  ContractData,
  DepositAccount,
  DepositData,
  DepositStatus,
  TxOutput
} from '@/types/index.js'

interface EscrowDepositConfig {
  refresh_ival : number
  verbose      : boolean
}

const DEFAULT_CONFIG : EscrowDepositConfig = {
  refresh_ival : 10,
  verbose      : true
}

export class EscrowDeposit extends EventEmitter <{
  'error'  : unknown
  'fetch'  : EscrowDeposit
  'status' : DepositStatus
  'update' : EscrowDeposit
}> {

  static async create (
    client  : EscrowClient,
    account : DepositAccount,
    utxo    : TxOutput,
    config ?: Partial<EscrowDepositConfig>
  ) {
    const req = { ...account, utxo }
    const res = await client.deposit.register(req)
    if (!res.ok) throw new Error(res.error)
    const dat = res.data.deposit
    return new EscrowDeposit(client, dat, config)
  }

  static async fetch (
    client  : EscrowClient,
    dpid    : string,
    config ?: Partial<EscrowDepositConfig>
  ) {
    const res = await client.deposit.read(dpid)
    if (!res.ok) throw new Error(res.error)
    const dat = res.data.deposit
    return new EscrowDeposit(client, dat, config)
  }

  readonly _client : EscrowClient
  readonly _opt    : EscrowDepositConfig
  
  _data    : DepositData
  _updated : number

  constructor (
    client  : EscrowClient,
    deposit : DepositData,
    config ?: Partial<EscrowDepositConfig>
  ) {
    super()
    this._client  = client
    this._opt     = { ...DEFAULT_CONFIG, ...config }
    this._data    = deposit
    this._updated = deposit.updated_at
  }

  get dpid () {
    return this.data.dpid
  }

  get client () {
    return this._client
  }

  get data () {
    return this._data
  }

  get opt () {
    return this._opt
  }

  get is_stale () {
    const ival = this.opt.refresh_ival
    return this._updated < now() - ival
  }

  get status () {
    return this.data.status
  }

  get updated_at () {
    return this._updated
  }

  async _digest () {
    const api = this.client.deposit
    const res = await api.digest(this.dpid)
    if (!res.ok) throw new Error(res.error)
    const dep = { ...this._data, ...res.data.deposit }
    validate_deposit(dep)
    return dep
  }

  async _fetch (force = false) {
    try {
      if (this.is_stale || force) {
        const res = await this._status()
        if (res.status !== this.status) {
          const data = await this._digest()
          this._update(data)
        } else {
          this._updated = now()
        }
        this.emit('fetch', this)
      }
    } catch (err) {
      this.emit('error', err)
    }
    return this
  }

  async _read () {
    const api = this.client.deposit
    const res = await api.read(this.dpid)
    if (!res.ok) throw new Error(res.error)
    const dep = res.data.deposit
    validate_deposit(dep)
    return dep
  }

  async _status () {
    const api = this.client.deposit
    const res = await api.status(this.dpid)
    if (!res.ok) throw new Error(res.error)
    return res.data.deposit
  }

  _update (data : DepositData) {
    const changed = (data.status !== this.status)
    try {
      this._data    = data 
      this._updated = now()
      if (changed) this.emit('status', data.status)
      this.emit('update', this)
    } catch (err) {
      this.emit('error', err)
    }
  }

  async close (
    signer : EscrowSigner,
    txfee  : number
  ) {
    const api = this.client.deposit
    const req = signer.account.close(this.data, txfee)
    const res = await api.close(this.dpid, req)
    if (!res.ok) throw new Error(res.error)
    this._update(res.data.deposit)
    return this
  }

  async fetch (force ?: boolean) {
    return this._fetch(force)
  }

  async lock (
    contract : ContractData,
    signer   : EscrowSigner
  ) {
    const api = this.client.deposit
    const req = signer.account.lock(contract, this.data)
    const res = await api.lock(this.dpid, req)
    if (!res.ok) throw new Error(res.error)
    this._update(res.data.deposit)
    return this
  }

  async poll (
    status  : DepositStatus,
    retries : number
  ) {
    for (let i = 0; i < retries; i++) {
      await this.fetch(true)
      if (this.status === status) {
        return this
      }
      await sleep(this.opt.refresh_ival * 1000)
    }
    throw new Error('polling timed out')
  }

  toJSON () {
    return this.data
  }

  toString() {
    return JSON.stringify(this.data)
  }
}
