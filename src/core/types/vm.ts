import { Literal } from '@/types.js'

import { ProgramEntry, ScheduleEntry } from './proposal.js'

export interface ProgramQuery {
  action   ?: string
  includes ?: Literal[]
  method   ?: string
  params   ?: Literal[]
  path     ?: string
}

export interface ProgramData {
  prog_id : string
  method  : string
  actions : string
  params  : Literal[]
  paths   : string
}

export interface WitnessTemplate {
  action : string
  args  ?: Literal[]
  method : string
  path   : string
  stamp ?: number
}

export interface WitnessPreimage {
  action  : string
  args    : Literal[]
  method  : string
  path    : string
  prog_id : string
  stamp   : number
}

export interface WitnessData extends WitnessPreimage {
  sigs : string[]
  wid  : string
}

export interface VMConfig {
  activated : number
  pathnames : string[]
  programs  : ProgramEntry[]
  schedule  : ScheduleEntry[]
  vmid      : string
}

export interface VMBase {
  activated : number          // Timestamp for when the VM was initialized.
  error     : string | null   // Error output of the VM.
  head      : string          // Current head of the commit-chain.
  output    : string | null   // Standard output of the VM.
  updated   : number          // Timestamp for when the VM was last updated.
  vmid      : string
}

export interface VMReceipt {
  head    : string
  sig     : string
  updated : number
  vmid    : string
}
