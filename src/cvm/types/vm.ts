import { MachineData }    from '@/core/types/index.js'
import { PathStateEntry } from './path.js'

export type VMStoreEntry = [ string, string ]

export type VMStatus = 'init' | 'open' | 'disputed' | 'closed' | 'spent'

export interface VMInput {
  action : string
  path   : string | null
  stamp  : number
  wid    : string
}

export interface CVMState {
  paths  : PathStateEntry[] // List of spend paths and their current state.
  status : VMStatus         // Current status of the VM.
  store  : VMStoreEntry[]   // Data store for each program in the VM.
}

export interface CVMData extends Omit<MachineData, 'state'> {
  state : CVMState
}
