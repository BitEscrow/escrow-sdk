
import { EscrowClient } from './client.js'
import { EventEmitter } from './emitter.js'
import { ContractData } from '../../types/index.js'

export class EscrowContract extends EventEmitter {
  readonly _client : EscrowClient
  readonly _data   : ContractData

  constructor (
    client   : EscrowClient,
    contract : ContractData
  ) {
    super()
    this._client = client
    this._data   = contract
  }

  get agent () {
    return {
      id : this.data.agent_id,
      pk : this.data.agent_pk,
      pn : this.data.agent_pn
    }
  }

  get cid () {
    return this._data.cid
  }

  get client () : EscrowClient {
    return this._client
  }

  get data () : ContractData {
    return this._data
  }

  get date () {
    return {
      activated  : this.data.activated,
      deadline   : this.data.deadline,
      expires_at : this.data.expires_at,
      published  : this.data.published,
      updated_at : this.data.updated_at
    }
  }

  get funds () {
    return {
      balance : this.data.balance,
      fees    : this.data.fees,
      pending : this.data.pending,
      total   : this.data.total
    }
  }

  get moderator () {
    return this._data.moderator
  }

  get outputs () {
    return this._data.outputs
  }

  get prop_id () {
    return this._data.prop_id
  }

  get status () {
    return this._data.status
  }

  get terms () {
    return this._data.terms
  }

  get vm_state () {
    return this._data.vm_state
  }

  toJSON() {
    return this.data
  }
}
