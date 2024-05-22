import {
  Literal,
  MachineData,
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

export type StateEntry = [
  path  : string,
  state : PathState
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

export interface VMInput {
  action : string
  path   : string
  stamp  : number
  wid    : string
}

export interface CVMState {
  paths  : StateEntry[]    // List of spend paths and their current state.
  status : PathStatus      // Current status of the VM.
  store  : StoreEntry[]    // Data store for each program in the VM.
}

export interface CVMData extends Omit<MachineData, 'state'> {
  state : CVMState
}
