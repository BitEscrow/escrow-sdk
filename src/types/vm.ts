import { Literal } from './base.js'

import {
  ProgramTerms,
  ScheduleTerms
} from './proposal.js'

export type PathStatus = 'init' | 'open' | 'disputed' | 'closed'
export type StoreEntry = [ string, string ]
export type WitProgram = (...args : string[]) => boolean

export type CommitEntry = [
  step   : number,
  stamp  : number,
  hash   : string,
  head   : string,
  action : string,
  path   : string
]

export type ProgramEntry = [
  prog_id   : string,
  method    : string,
  actions   : string,
  paths     : string,
  ...params : Literal[]
]

export type StateEntry = [
  path  : string, 
  state : PathState
]

export type TaskEntry = [
  timer  : number, 
  action : string, 
  paths  : string
]

export enum PathState {
  open = 0,
  locked,
  disputed,
  closed
}

export interface StateData {
  commits  : CommitEntry[]
  error    : string | null
  head     : string
  output   : string | null
  paths    : StateEntry[]
  programs : ProgramEntry[]
  steps    : number
  start    : number
  status   : PathStatus
  store    : StoreEntry[]
  tasks    : TaskEntry[]
  updated  : number
}

export interface MachineConfig {
  activated : number
  cid       : string
  pathnames : string[]
  programs  : ProgramTerms[]
  schedule  : ScheduleTerms[]
}
