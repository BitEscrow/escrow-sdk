import { ContractData } from '../contract.js'
import { VMReceipt }    from '../vm.js'
import { WitnessData }  from '../witness.js'

export interface VMDataResponse {
  contract ?: ContractData
  vmdata    : VMReceipt
}

export interface VMListResponse {
  vmdata     : VMReceipt
  statements : WitnessData[]
}
