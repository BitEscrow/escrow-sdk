import EscrowClient    from './client.js'
import EscrowContract  from './contract.js'
import EventEmitter    from './emitter.js'
import { WitnessData } from '../../types/index.js'

export default class ContractVM extends EventEmitter {
  readonly _client   : EscrowClient
  readonly _contract : EscrowContract
  readonly _witness  : WitnessData[]

  constructor (
    client   : EscrowClient,
    contract : EscrowContract,
    witness  : WitnessData[]
  ) {
    super()
    this._client   = client
    this._contract = contract
    this._witness  = witness
  }

  get client () : EscrowClient {
    return this._client
  }

  get contract () : EscrowContract {
    return this._contract
  }

  get witness () : WitnessData[] {
    return this._witness
  }
}
