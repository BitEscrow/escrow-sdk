import {
  Literal,
  ProgramData,
  WitnessData
} from '@/core/types/index.js'

export type ProgramExec = (
  params : Literal[],
  store  : StoreEntry
) => ProgramReturn

export type ProgramReturn = (
  witness : WitnessData
) => boolean | Promise<boolean>

export type ProgramVerify = (
  params : Literal[]
) => string | null

export type PathStatus = 'init' | 'open' | 'disputed' | 'closed'
export type StoreEntry = [ string, string ]

export type CommitEntry = [
  step   : number,
  stamp  : number,
  hash   : string,
  head   : string,
  action : string,
  path   : string
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

export interface ProgMethodAPI {
  exec   : ProgramExec
  verify : ProgramVerify
}

interface VMData {
  active_at : number          // Timestamp for when the VM was initialized.
  error     : string | null   // Error output of the VM.
  head      : string          // Current head of the commit-chain.
  output    : string | null   // Standard output of the VM.
  step      : number          // Counts the number of commits to the VM.
  updated   : number          // Timestamp for when the VM was last updated.
  vmid      : string          // The virtual machine identifier.
}

export interface VMState extends VMData {
  commits   : CommitEntry[]   // List of commits to the VM.
  paths     : StateEntry[]    // List of spend paths and their current state.
  programs  : ProgramData[]   // List of programs available in the VM.
  status    : PathStatus      // Current status of the VM.
  store     : StoreEntry[]    // Data store for each program in the VM.
  tasks     : TaskEntry[]     // List of upcoming tasks within the VM.
}
