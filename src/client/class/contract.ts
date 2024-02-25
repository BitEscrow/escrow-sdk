import { now, sleep }        from '@/lib/util.js'
import { validate_contract } from '@/validators/contract.js'
import { EscrowClient }      from './client.js'
import { EventEmitter }      from './emitter.js'
import { ContractVM }        from './machine.js'
import { EscrowSigner }      from './signer.js'

import {
  ContractData,
  ContractStatus,
  DraftData
} from '@/types/index.js'

interface EscrowContractConfig {
  refresh_ival : number
  verbose      : boolean
}

const DEFAULT_CONFIG : EscrowContractConfig = {
  refresh_ival : 10,
  verbose      : true
}

export class EscrowContract extends EventEmitter <{
  'error'  : unknown
  'fetch'  : EscrowContract
  'status' : ContractStatus
  'update' : EscrowContract
}> {

  static async create (
    client  : EscrowClient,
    draft   : DraftData,
    config ?: Partial<EscrowContractConfig>
  ) {
    const res = await client.contract.create(draft)
    if (!res.ok) throw new Error(res.error)
    const dat = res.data.contract
    return new EscrowContract(client, dat, config)
  }

  static async fetch (
    client  : EscrowClient,
    cid     : string,
    config ?: Partial<EscrowContractConfig>
  ) {
    const res = await client.contract.read(cid)
    if (!res.ok) throw new Error(res.error)
    const dat = res.data.contract
    return new EscrowContract(client, dat, config)
  }

  readonly _client : EscrowClient
  readonly _opt    : EscrowContractConfig
  
  _data    : ContractData
  _updated : number

  constructor (
    client   : EscrowClient,
    contract : ContractData,
    config  ?: Partial<EscrowContractConfig>
  ) {
    super()
    this._client  = client
    this._opt     = { ...DEFAULT_CONFIG, ...config }
    this._data    = contract
    this._updated = contract.updated_at
  }

  get cid () {
    return this.data.cid
  }

  get client () {
    return this._client
  }

  get data () {
    return this._data
  }

  get funds () {
    const api = this.client.contract
    return api.funds(this.cid).then(e => {
      if (!e.ok) throw new Error(e.error)
      return e.data.funds
    })
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

  get vm () {
    return new ContractVM(this.client, this.data, this.opt)
  }

  async _digest () {
    const api = this.client.contract
    const res = await api.digest(this.cid)
    if (!res.ok) throw new Error(res.error)
    const contract = { ...this._data, ...res.data.contract }
    validate_contract(contract)
    return contract
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
    const api = this.client.contract
    const res = await api.read(this.cid)
    if (!res.ok) throw new Error(res.error)
    const contract = res.data.contract
    validate_contract(contract)
    return contract
  }

  async _status () {
    const api = this.client.contract
    const res = await api.status(this.cid)
    if (!res.ok) throw new Error(res.error)
    return res.data.contract
  }

  _update (data : ContractData) {
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

  async cancel (signer : EscrowSigner) {
    const api = this.client.contract
    const tkn = signer.request.contract_cancel(this.cid)
    const res = await api.cancel(this.cid, tkn)
    if (!res.ok) throw new Error(res.error)
    this._update(res.data.contract)
    return this
  }

  async fetch (force ?: boolean) {
    return this._fetch(force)
  }

  async poll (
    status   : ContractStatus,
    retries  : number
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
