import { WitnessReceipt } from '@/core/types/witness.js'

export interface WitnessDataResponse {
  receipt : WitnessReceipt
}

export interface WitnessListResponse {
  receipts : WitnessReceipt[]
}
