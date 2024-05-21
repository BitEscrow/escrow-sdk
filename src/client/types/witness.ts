import { WitnessCommit } from '@/core/types/witness.js'

export interface WitnessDataResponse {
  statement : WitnessCommit
}

export interface WitnessListResponse {
  statements : WitnessCommit[]
}
