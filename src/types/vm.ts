import { Literal } from './base.js'

export type PathStatus = 'init' | 'open' | 'disputed' | 'closed'
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

export type StoreEntry = [
  label : string,
  store : StoreItem[]
]

export type StoreItem = [
  key : string,
  val : string
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
  result   : string | null
  steps    : number
  start    : number
  status   : PathStatus
  store    : StoreEntry[]
  tasks    : TaskEntry[]
  updated  : number
}
