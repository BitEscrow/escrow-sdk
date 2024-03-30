import { ContractData }        from '../contract.js'
import { VMData, WitnessData } from '../witness.js'

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
