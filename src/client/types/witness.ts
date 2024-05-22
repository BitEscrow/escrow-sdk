import { WitnessCommit } from '@/core/types/witness.js'

export interface WitnessDataResponse {
  commit : WitnessCommit
}

export interface WitnessListResponse {
  commits : WitnessCommit[]
}
