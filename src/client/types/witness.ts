import { WitnessData } from '@/core/types/witness.js'

export interface WitnessDataResponse {
  commit : WitnessData
}

export interface WitnessListResponse {
  commits : WitnessData[]
}
