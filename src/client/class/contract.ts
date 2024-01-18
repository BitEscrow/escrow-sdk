import { EventEmitter } from './emitter.js'
import { ContractData } from '../../types/index.js'

export class EscrowContract extends EventEmitter {
  readonly _data   : ContractData

  constructor (contract : ContractData) {
    super()
    this._data = contract
  }

  get agent () {
    return {
      id : this.data.agent_id,
      pk : this.data.agent_pk,
      pn : this.data.agent_pn
    }
  }

  get cid () {
    return this.data.cid
  }

  get data () {
    return this._data
  }

  get date () {
    const { activated, deadline, expires_at, published, updated_at } = this.data
    return { activated, deadline, expires_at, published, updated_at }
  }

  get amt () {
    const { balance, fees, pending, terms, total } = this.data
    return {
      balance,
      fees     : fees.reduce((a, b) => a + b[0], 0),
      payments : terms.payments.reduce((a, b) => a + b[0], 0),
      pending,
      subtotal : terms.value,
      total
    }
  }

  get moderator () {
    return this.data.moderator
  }

  get outputs () {
    return this.data.outputs
  }

  get prop_id () {
    return this.data.prop_id
  }

  get pubkeys () {
    return this.data.pubkeys
  }

  get signatures () {
    return this.data.signatures
  }

  get status () {
    return this.data.status
  }

  get terms () {
    return this.data.terms
  }

  get tx () {
    const { settled, settled_at, spent, spent_at, spent_txid } = this.data
    return { settled, settled_at, spent, spent_at, spent_txid }
  }

  get vm_state () {
    return this._data.vm_state
  }

  toJSON () {
    return this.data
  }

  toString() {
    return JSON.stringify(this.data)
  }
}
