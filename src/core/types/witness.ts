import { Literal } from './base.js'

export interface WitnessTemplate {
  action : string
  args  ?: Literal[]
  method : string
  path   : string
  stamp ?: number
  vmid   : string
}

export interface WitnessPreImage {
  action  : string
  args    : Literal[]
  method  : string
  path    : string
  prog_id : string
  stamp   : number
  vmid    : string
}

export interface WitnessData extends WitnessPreImage {
  sigs : string[]
  wid  : string
}
