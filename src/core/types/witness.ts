import { Literal } from './base.js'

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
  vmid    : string
}

export interface WitnessData extends WitnessPreImage {
  sigs : string[]
  wid  : string
}

export interface ReceiptPreImage extends WitnessData {
  receipt_at : number
  server_pk  : string
  vm_hash    : string
  vm_output  : string | null
  vm_step    : number
}

export interface WitnessReceipt extends ReceiptPreImage {
  receipt_id : string
  server_sig : string
}
