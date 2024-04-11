import { WitnessReceipt } from '../witness.js'

export interface WitnessDataResponse {
  witness : WitnessReceipt
}

export interface WitnessListResponse {
  statements : WitnessReceipt[]
}
