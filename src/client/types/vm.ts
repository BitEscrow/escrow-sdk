import { VMData }         from '@/core/types/machine.js'
import { WitnessReceipt } from '@/core/types/witness.js'

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
