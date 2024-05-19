import { Literal } from './base.js'

export interface WitnessTemplate {
  action   : string
  args    ?: Literal[]
  content ?: string
  method   : string
  path     : string
  stamp   ?: number
}

export interface WitnessPreImage {
  action  : string
  args    : Literal[]
  content : string
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

export interface ReceiptPreImage extends WitnessData {
  receipt_at : number
  agent_pk  : string
  vm_closed  : boolean
  vm_hash    : string
  vm_output  : string | null
  vm_step    : number
}

export interface WitnessReceipt extends ReceiptPreImage {
  receipt_id  : string
  receipt_sig : string
}
