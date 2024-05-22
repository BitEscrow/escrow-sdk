import { MachineData }    from '@/core/types/machine.js'
import { WitnessReceipt } from '@/core/types/witness.js'

export interface VMDataResponse {
  vmdata : MachineData
}

export interface VMListResponse {
  machines : MachineData[]
}

export interface VMSubmitResponse {
  receipt : WitnessReceipt
  vmdata  : MachineData
}
