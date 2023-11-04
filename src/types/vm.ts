import { Json, Literal } from './base.js'

export type PathStatus = 'init' | 'open' | 'disputed' | 'closed'
export type WitProgram = (...args : string[]) => boolean

export type CommitEntry = [
  step : number,
  mark : number,
  wid  : string,
  head : string
]

export type ProgramEntry = [
  prog_id : string,
  actions : string,
  paths   : string,
  method  : string,
  params  : string[]
]

export type StateEntry = [
  path  : string, 
  state : PathState
]

export type StoreEntry<T = Json> = [
  label : string,
  store : T
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

export interface ProgramData {
  id      : string
  actions : string
  paths   : string
  method  : string
  params  : Literal[]
}

export interface ProgramMethod {
  sign : Function
}

export interface StateData {
  commits  : CommitEntry[]
  error    : string | null
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

export interface WitnessData {
  prog_id : string,
  action  : string,
  args    : string[],
  method  : string,
  path    : string,
}
