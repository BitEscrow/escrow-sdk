import { now, sleep }       from '@/util.js'
import { verify_execution } from '@/core/validators/contract.js'
import { EscrowClient }     from './client.js'
import { EventEmitter }     from './emitter.js'
import { EscrowSigner }     from './signer.js'

import {
  ContractData,
  PathStatus,
  StateData,
  WitnessData,
  WitnessTemplate
} from '@/core/types/index.js'

import * as assert from '@/assert.js'

interface ContractVMConfig {
  refresh_ival : number
  verbose      : boolean
}

const DEFAULT_CONFIG : ContractVMConfig = {
  refresh_ival : 10,
  verbose      : true
}

export class ContractVM extends EventEmitter <{
  'error'  : unknown
  'fetch'  : ContractVM
  'update' : ContractVM
}> {
  static async fetch (
    client  : EscrowClient,
    cid     : string,
    config ?: Partial<ContractVMConfig>
  ) {
    const res_state = await client.contract.read(cid)
    if (!res_state.ok) throw new Error(res_state.error)
    const contract  = res_state.data.contract
    return new ContractVM(client, contract, config)
  }

  readonly _client   : EscrowClient
  readonly _contract : ContractData
  readonly _opt      : ContractVMConfig

  _data    : StateData
  _updated : number

  constructor (
    client   : EscrowClient,
    contract : ContractData,
    config  ?: Partial<ContractVMConfig>
  ) {
    assert.ok(contract.vm_state !== null, 'contract vm is not active')
    super()
    this._client   = client
    this._contract = contract
    this._opt      = { ...DEFAULT_CONFIG, ...config }
    this._data     = contract.vm_state
    this._updated  = now()
  }

  get cid () {
    return this._contract.cid
  }

  get client () {
    return this._client
  }

  get data () {
    return this._data
  }

  get head () {
    return this.data.head
  }

  get opt () {
    return this._opt
  }

  get is_stale () {
    const ival = this.opt.refresh_ival
    return this._updated < now() - ival
  }

  get statements () {
    return this._witness()
  }

  get status () {
    return this.data.status
  }

  get updated_at () {
    return this._updated
  }

  async _fetch () {
    try {
      if (this.is_stale) {
        const api   = this.client.contract
        const res   = await api.vmstate(this.cid)
        if (!res.ok) throw new Error(res.error)
        const state = res.data.vm_state
        if (state.head !== this.head) {
          void this._update(state)
        } else {
          this._updated = now()
        }
      }
    } catch (err) {
      this.emit('error', err)
    }
  }

  async _submit (witness : WitnessData) {
    const api = this.client.contract
    const res = await api.submit(this.cid, witness)
    if (!res.ok) throw new Error(res.error)
    const state = res.data.contract.vm_state
    assert.ok(state !== null, 'contract state returned null')
    return this._update(state)
  }

  async _update (state : StateData) {
    this._data = state
    this.emit('update', this)
    this._updated = now()
    return this
  }

  async _witness () {
    const api = this.client.contract
    const res = await api.witness(this.cid)
    if (!res.ok) throw new Error(res.error)
    return res.data.statements
  }

  async fetch () {
    await this._fetch()
    return this
  }

  async poll (
    status   : PathStatus,
    retries  : number
  ) {
    for (let i = 0; i < retries; i++) {
      await this._fetch()
      if (this.status === status) {
        return this
      }
      await sleep(this.opt.refresh_ival * 1000)
    }
    throw new Error('polling timed out')
  }

  async check (
    signer   : EscrowSigner,
    template : WitnessTemplate
  ) {
    return signer.witness.can_sign(this._contract, template)
  }

  async sign (
    signer   : EscrowSigner,
    template : WitnessTemplate
  ) {
    const witness = signer.witness.sign(this._contract, template)
    return this.submit(witness)
  }

  async submit (witness : WitnessData) {
    return this._submit(witness)
  }

  async verify (contract : ContractData) {
    const statements = await this.statements
    verify_execution(contract, statements, this.data)
  }

  toJSON () {
    return this.data
  }

  toString () {
    return JSON.stringify(this.data)
  }
}
