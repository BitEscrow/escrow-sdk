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
  commits  : CommitEntry[]   // List of commits to the VM.
  error    : string | null   // Error output of the VM.
  head     : string          // Current head of the commit-chain.
  output   : string | null   // Standard output of the VM.
  paths    : StateEntry[]    // List of spend paths and their current state.
  programs : ProgramEntry[]  // List of programs available in the VM.
  steps    : number          // Counter of state updates to the VM.
  start    : number          // Timestamp for when the VM was initialized.
  status   : PathStatus      // Current status of the VM.
  store    : StoreEntry[]    // Data store for each program in the VM.
  tasks    : TaskEntry[]     // List of upcoming tasks within the VM.
  updated  : number          // Timestamp for when the VM was last updated.
}

export interface MachineConfig {
  activated : number
  cid       : string
  pathnames : string[]
  programs  : ProgramTerms[]
  schedule  : ScheduleTerms[]
}
