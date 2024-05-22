import { MachineData }   from '@/core/types/machine.js'
import { WitnessCommit } from '@/core/types/witness.js'

export interface VMDataResponse {
  vmdata : MachineData
}

export interface VMListResponse {
  machines : MachineData[]
}

export interface VMSubmitResponse {
  commit : WitnessCommit
  vmdata : MachineData
}
