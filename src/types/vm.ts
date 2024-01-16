import { Literal }   from './base.js'
import { PathEntry, ProgramTerms, ScheduleTerms } from './proposal.js'

export type PathStatus = 'init' | 'open' | 'disputed' | 'closed'
export type StoreEntry = [ string, string ]
export type WitProgram = (...args : string[]) => boolean

export type CommitEntry = [
  step : number,
  mark : number,
  wid  : string,
  head : string
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
  head     : string
  paths    : StateEntry[]
  programs : ProgramEntry[]
  result   : string | null
  steps    : number
  start    : number
  status   : PathStatus
  store    : StoreEntry[]
  tasks    : TaskEntry[]
  updated  : number
}

export interface MachineConfig {
  cid       : string
  paths     : PathEntry[]
  programs  : ProgramTerms[]
  published : number
  schedule  : ScheduleTerms[]
}
