import { EscrowContract } from './contract.js'
import { EventEmitter }   from './emitter.js'
import { WitnessData }    from '../../types/index.js'

export default class ContractVM extends EventEmitter {
  readonly _ct : EscrowContract
  readonly _wt : WitnessData[]

  constructor (
    contract : EscrowContract,
    witness  : WitnessData[]
  ) {
    super()
    this._ct = contract
    this._wt  = witness
  }

  get contract () : EscrowContract {
    return this._ct
  }

  get witness () : WitnessData[] {
    return this._wt
  }
}
