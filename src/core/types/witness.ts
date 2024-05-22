import { Literal } from './base.js'

export interface WitnessTemplate {
  action   : string
  args    ?: Literal[]
  content ?: string
  method   : string
  path     : string
  stamp   ?: number
}

export interface WitnessDataPreImage {
  action  : string
  args    : Literal[]
  content : string
  method  : string
  path    : string
  prog_id : string
  stamp   : number
  vmid    : string
}

export interface WitnessData extends WitnessDataPreImage {
  sigs : string[]
  wid  : string
}

export interface WitnessCommitPreImage extends WitnessData {
  agent_pk  : string
  commit_at : number
  vm_closed : boolean
  vm_head   : string
  vm_output : string | null
  vm_step   : number
}

export interface WitnessCommit extends WitnessCommitPreImage {
  commit_id  : string
  commit_sig : string
}
