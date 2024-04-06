import { Literal }       from './base.js'
import { ProgramEntry, ScheduleEntry } from './proposal.js'
import { WitnessData }   from './witness.js'

export interface VirtualMachineAPI {
  actions : string[]
  methods : string[]
  tag     : string
  check   : (method : string, params   : Literal[]) => string | null
  eval    : (data   : VMData, witness  : WitnessData | WitnessData[]) => VMData
  init    : (config : VMConfig) => VMData
  run     : (data   : VMData, stop_at ?: number) => VMData
}

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

export interface VMConfig {
  active_at : number
  closes_at : number
  engine    : string
  pathnames : string[]
  programs  : ProgramEntry[]
  schedule  : ScheduleEntry[]
  vmid      : string
}

export interface VMData {
  active_at  : number
  commit_at  : number
  closes_at  : number
  engine     : string
  error      : string | null   // Error output of the VM.
  head       : string          // Current head of the commit-chain.
  output     : string | null   // Standard output of the VM.
  pathnames  : string[]
  programs   : ProgramData[]
  state      : string
  step       : number          // Counts the number of commits to the VM.'
  tasks      : ScheduleEntry[]
  updated_at : number          // Timestamp for when the VM was last updated.
  vmid       : string
}

export interface VMReceipt extends VMData {
  created_at : number
  receipt_id : string
  server_pk  : string
  server_sig : string
}
