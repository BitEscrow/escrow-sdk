import { VMData }         from '../machine.js'
import { WitnessReceipt } from '../witness.js'

export interface VMDataResponse {
  vmdata : VMData
}

export interface VMListResponse {
  machines : VMData[]
}

export interface VMSubmitResponse {
  receipt : WitnessReceipt
  vmdata  : VMData
}
