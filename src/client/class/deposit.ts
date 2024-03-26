import { now, sleep }       from '@/util.js'
import { validate_deposit } from '@/core/validators/deposit.js'
import { EscrowClient }     from './client.js'
import { EventEmitter }     from './emitter.js'
import { EscrowSigner }     from './signer.js'
import { update_deposit }   from '@/client/lib/deposit.js'

import {
  ContractData,
  AccountData,
  DepositData,
  DepositDigest,
  DepositStatus,
  TxOutput
} from '@/core/types/index.js'

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
    account : AccountData,
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
  _init    : boolean
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
    this._init    = false
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

  async _fetch (force = false) {
    try {
      if (this.is_stale || force) {
        const res = await this._status()
        if (res.updated) {
          void this._update(res.deposit)
        } else {
          this._updated = now()
        }
        this.emit('fetch', this)
      }
      if (!this._init) {
        this._init = true
        this.emit('status', this.status)
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
    return res.data
  }

  async _update (updated : DepositData | DepositDigest) {
    const changed = (updated.status !== this.status)
    try {
      const data    = this.data
      this._data    = await update_deposit(data, updated)
      this._updated = now()
      if (changed) {
        if (!this._init) this._init = true
        this.emit('status', updated.status)
      }
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
    void this._update(res.data.deposit)
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
    void this._update(res.data.deposit)
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

  toString () {
    return JSON.stringify(this.data)
  }
}
