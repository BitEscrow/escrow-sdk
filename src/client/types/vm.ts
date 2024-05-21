import { MachineData }    from '@/core/types/machine.js'
import { WitnessCommit } from '@/core/types/witness.js'

export interface VMDataResponse {
  machine : MachineData
}

export interface VMListResponse {
  machines : MachineData[]
}

export interface VMSubmitResponse {
  machine   : MachineData
  statement : WitnessCommit
}
