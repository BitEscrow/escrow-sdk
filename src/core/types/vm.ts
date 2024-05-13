import { Literal }                     from './base.js'
import { ProgramEntry, ScheduleEntry } from './proposal.js'
import { WitnessData }                 from './witness.js'

export type VMRunState = VMOpen | VMClosed
export type VMData     = VMBase & VMRunState

export interface ScriptEngineAPI {
  actions : string[]
  methods : string[]
  states  : string[]
  label   : string
  eval    : (data   : VMData, witness  : WitnessData | WitnessData[]) => VMData
  init    : (config : EngineConfig) => VMData
  run     : (data   : VMData, stop_at ?: number) => VMData
  verify  : (method : string, params   : Literal[]) => string | null
}

interface VMOpen {
  closed    : false
  closed_at : null
}

interface VMClosed {
  closed    : true
  closed_at : number
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

export interface EngineConfig {
  active_at  : number
  engine     : string
  expires_at : number
  pathnames  : string[]
  programs   : ProgramEntry[]
  schedule   : ScheduleEntry[]
  vmid       : string
}

export interface VMBase {
  active_at  : number
  commit_at  : number
  engine     : string
  error      : string | null   // Error output of the VM.
  expires_at : number
  head       : string          // Current head of the commit-chain.
  output     : string | null
  pathnames  : string[]
  programs   : ProgramData[]
  state      : string
  step       : number          // Counts the number of commits to the VM.'
  tasks      : ScheduleEntry[]
  updated_at : number
  vmid       : string
}
