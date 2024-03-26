import { WitnessData } from '../vm.js'

export interface VMResponse<T> {
  vm_state : T
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
