import { ContractData } from '../contract.js'
import { VMData }       from '../vm.js'
import { WitnessData }  from '../witness.js'

export interface VMResponse {
  contract ?: ContractData
  vm_state  : VMData
}

export interface WitnessRequest {
  witness : WitnessData
}

export interface WitnessListResponse {
  statements : WitnessData[]
}

export interface WitnessDataResponse {
  witness : WitnessData
}
