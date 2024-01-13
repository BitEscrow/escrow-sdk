import EscrowClient from './client.js'
import EventEmitter from './emitter.js'

import { DepositData }  from '../../types/index.js'

export default class EscrowDeposit extends EventEmitter {
  readonly _client : EscrowClient
  readonly _data   : DepositData

  constructor (
    client  : EscrowClient,
    deposit : DepositData
  ) {
    super()
    this._client = client
    this._data   = deposit
  }

  get agent () {
    return {
      id  : this.data.agent_id,
      key : this.data.agent_pk,
      pn  : this.data.agent_pn
    }
  }

  get block () {
    return {
      hash   : this.data.block_hash,
      height : this.data.block_height,
      time   : this.data.block_time
    }
  }

  get confirmed () {
    return this.data.confirmed
  }

  get client () : EscrowClient {
    return this._client
  }

  get covenant () {
    return this.data.covenant
  }

  get data () : DepositData {
    return this._data
  }

  get date () {
    return {
      created_at : this.data.created_at,
      expires_at : this.data.expires_at,
      updated_at : this.data.updated_at
    }
  }

  get id () {
    return this.data.dpid
  }

  get member_pk () {
    return this.data.member_pk
  }

  get return_tx () {
    return this.data.return_tx
  }

  get sequence () {
    return this.data.sequence
  }

  get spend () {
    return {
      is_settled : this.data.settled,
      settled_at : this.data.settled_at,
      is_spent   : this.data.spent,
      spent_at   : this.data.spent_at,
      spent_txid : this.data.spent_txid
    }
  }

  get status () {
    return this.data.status
  }

  get txout () {
    return {
      txid      : this.data.txid,
      vout      : this.data.vout,
      value     : this.data.value,
      scriptkey : this.data.scriptkey
    }
  }

  toJSON() {
    return this.data
  }

  toString() {
    return JSON.stringify(this.data, null, 2)
  }
}
