import { now }               from '@/lib/util.js'
import { ContractData }      from '@/types/index.js'
import { validate_contract } from '@/validators/contract.js'
import { EscrowClient }      from './client.js'
import { EventEmitter }      from './emitter.js'
import { DraftSession }      from './session.js'

interface EscrowContractConfig {
  init_data    : ContractData | null
  refresh_ival : number
  verbose      : true
}

const DEFAULT_CONFIG : EscrowContractConfig = {
  init_data    : null,
  refresh_ival : 5000,
  verbose      : true
}

export class EscrowContract extends EventEmitter <{
  'error'  : unknown
  'ready'  : EscrowContract
  'status' : EscrowContract
  'update' : EscrowContract
}> {

  static async create (
    client  : EscrowClient,
    draft   : DraftSession,
    config ?: Partial<EscrowContractConfig>
  ) {
    const res = await client.contract.create(draft)
    if (!res.ok) throw new Error(res.error)
    const ct  = res.data.contract
    const opt = { ...config, init_data : ct }
    return new EscrowContract(ct.cid, client, opt)
  }

  readonly _cid    : string
  readonly _client : EscrowClient
  readonly _opt    : EscrowContractConfig
  
  _data    : ContractData | null
  _updated : number | null

  constructor (
    cid    : string,
    client : EscrowClient,
    config ?: Partial<EscrowContractConfig>
  ) {
    const opt = { ...DEFAULT_CONFIG, ...config }
    super()
    this._cid     = cid
    this._client  = client
    this._opt     = opt
    this._data    = opt.init_data
    this._updated = opt.init_data?.updated_at ?? null
  }

  get cid () {
    return this._cid
  }

  get client () {
    return this._client
  }

  get data () {
    return this._check()
  }

  get opt () {
    return this._opt
  }

  get is_stale () {
    const ival = this.opt.refresh_ival
    return (
      this._updated === null || 
      this._updated < now() - ival
    )
  }

  get status () {
    if (this._data === null) {
      throw new Error('contract store not initialized')
    }
    return this._data.status
  }

  get updated_at () {
    if (this._updated === null) {
      throw new Error('contract store not initialized')
    }
    return this._updated
  }

  debug (...s : unknown[]) {
    return (this.opt.verbose) ? console.log(...s) : null
  }

  async _check () {
    if (this._data === null) {
      await this._update()
    } else if (this.is_stale) {
      try {
        const { status } = await this._status()
        if (status !== this.status) {
          await this._update()
        }
        this.emit('status', this)
      } catch (err) {
        this.debug(err)
        void this.emit('error', err)
      }
    }
    if (this._data === null) {
      throw new Error('unable to initialize store')
    }
    return this._data
  }

  async _digest () {
    if (this._data === null) {
      throw new Error('illegal digest call on null contract')
    }
    const res = await this.client.contract.digest(this._cid)
    if (!res.ok) throw new Error(res.error)
    const contract = { ...this._data, ...res.data.contract }
    validate_contract(contract)
    return contract
  }

  async _read () {
    const res = await this.client.contract.read(this._cid)
    if (!res.ok) throw new Error(res.error)
    const contract = res.data.contract
    validate_contract(contract)
    return contract
  }

  async _status () {
    const res = await this.client.contract.status(this._cid)
    if (!res.ok) throw new Error(res.error)
    return res.data.contract
  }

  async _update () {
    try {
      if (this._data === null) {
        this._data = await this._read()
        this.emit('ready', this)
      } else {
        this._data = await this._digest()
        this.emit('update', this)
      }
      this.debug('new data:', this._data)
      this._updated = now()
    } catch (err) {
      this.debug(err)
      void this.emit('error', err)
    }
    return this._data
  }

  toJSON () {
    return this.data
  }

  toString() {
    return JSON.stringify(this.data)
  }
}
