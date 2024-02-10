import { now, sleep }              from '@/lib/util.js'
import { validate_deposit } from '@/validators/deposit.js'
import { DepositData, DepositStatus }      from '@/types/index.js'
import { EscrowClient }     from './client.js'
import { EventEmitter }     from './emitter.js'

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
  'update' : EscrowDeposit
}> {

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

  async _fetch () {
    try {
      if (this.is_stale) {
        const { status } = await this._status()
        if (status !== this.status) {
          await this._update()
        } else {
          this._updated = now()
        }
      }
    } catch (err) {
      this.emit('error', err)
    }
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

  async _update () {
    try {
      const data    = await this._digest()
      this._data    = data 
      this._updated = now()
      this.emit('update', this)
    } catch (err) {
      this.emit('error', err)
    }
  }

  async close () {

  }

  async fetch () {
    await this._fetch()
    return this
  }

  async poll (
    status   : DepositStatus,
    interval : number,
    retries  : number
  ) {
    return new Promise(async (res) => {
      for (let i = 0; i < retries; i++) {
        await this.fetch()
        if (this.status === status) {
          res(this)
        }
        await sleep(interval * 1000)
      }
    })
  }

  async lock () {

  }
   

  toJSON () {
    return this.data
  }

  toString() {
    return JSON.stringify(this.data)
  }
}
