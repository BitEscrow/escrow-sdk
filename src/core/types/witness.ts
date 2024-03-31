import { Literal } from './base.js'
import { VMData }  from './vm.js'

export interface WitnessTemplate {
  action : string
  args  ?: Literal[]
  method : string
  path   : string
  stamp ?: number
}

export interface WitnessPreImage {
  action  : string
  args    : Literal[]
  method  : string
  path    : string
  prog_id : string
  stamp   : number
}

export interface WitnessData extends WitnessPreImage {
  sigs : string[]
  wid  : string
}

export interface WitnessReceipt extends VMData {
  created_at : number
  hash       : string
  id         : string
  pubkey     : string
  sig        : string
}
