import { Literal }                     from './base.js'
import { ProgramData }                 from './program.js'
import { ProgramEntry, ScheduleEntry } from './proposal.js'
import { WitnessData }                 from './witness.js'

export type VMRunState  = VMOpen | VMClosed
export type MachineData = MachineBase & VMRunState

export interface ScriptEngineAPI {
  actions : string[]
  methods : string[]
  states  : string[]
  label   : string
  eval    : (data   : MachineData, witness  : WitnessData | WitnessData[]) => MachineData
  init    : (config : MachineConfig) => MachineData
  run     : (data   : MachineData, stop_at ?: number) => MachineData
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

export interface MachineConfig {
  active_at  : number
  engine     : string
  expires_at : number
  pathnames  : string[]
  programs   : ProgramEntry[]
  schedule   : ScheduleEntry[]
  vmid       : string
}

export interface VMSubmitRequest {
  vmid    : string
  witness : WitnessData
}

export interface MachineBase {
  active_at  : number
  commit_at  : number
  engine     : string
  error      : string | null
  expires_at : number
  head       : string
  output     : string | null
  pathnames  : string[]
  programs   : ProgramData[]
  state      : string
  step       : number
  tasks      : ScheduleEntry[]
  updated_at : number
  vmid       : string
}
