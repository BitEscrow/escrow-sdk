import { WitnessReceipt } from '@/core/types/witness.js'

export interface WitnessDataResponse {
  witness : WitnessReceipt
}

export interface WitnessListResponse {
  statements : WitnessReceipt[]
}
