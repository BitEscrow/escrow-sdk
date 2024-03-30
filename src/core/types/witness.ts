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

export interface VMConfig {
  activated : number
  pathnames : string[]
  programs  : ProgramEntry[]
  schedule  : ScheduleEntry[]
  vmid      : string
}

export interface VMData {
  activated : number          // Timestamp for when the VM was initialized.
  error     : string | null   // Error output of the VM.
  head      : string          // Current head of the commit-chain.
  output    : string | null   // Standard output of the VM.
  stamp     : number          // Timestamp for when the VM was last updated.
  step      : number          // Counts the number of commits to the VM.
  vmid      : string          // The virtual machine identifier.
}

export interface VirtualMachineAPI {
  data    : VMData
  methods : string[]
  check   : (method  : string, params  : Literal[])   => string | null
  eval    : (witness : WitnessData, marker ?: number) => VMData
  run     : (marker ?: number)                        => VMData
}
