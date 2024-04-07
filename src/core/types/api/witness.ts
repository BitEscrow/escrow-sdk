import { WitnessData } from '../witness.js'

export interface WitnessDataResponse {
  witness : WitnessData
}

export interface WitnessListResponse {
  statements : WitnessData[]
}
