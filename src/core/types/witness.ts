import { Literal } from '@/types/index.js'

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

export interface WitnessReceiptPreImage extends WitnessData {
  agent_pk  : string
  commit_at : number
  vm_closed : boolean
  vm_head   : string
  vm_output : string | null
  vm_step   : number
}

export interface WitnessReceipt extends WitnessReceiptPreImage {
  commit_id  : string
  commit_sig : string
}
