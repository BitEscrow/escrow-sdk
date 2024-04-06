/* Global Imports */

import { Buff }         from '@cmdcode/buff'
import { ProgramEntry } from '@/core/types/index.js'

import {
  CVMData,
  PathState,
  PathStatus,
  StateEntry,
  VMInput
} from '../types.js'

/* Local Imports */

import { run_path_action } from './action.js'

import {
  get_path_state,
  init_path_state
} from './path.js'

export function init_vm_state (
  paths    : string[],
  programs : ProgramEntry[]
) {
  const states : StateEntry[] = []
  for (const path of paths) {
    const state = init_path_state(path, programs)
    states.push([ path, state ])
  }
  return states
}

export function update_vm_state (
  data  : CVMData,
  input : VMInput
) {
  check_update_stamp(data, input.stamp)

  const { action, path, stamp } = input
  const { state, step } = data
  const [ pstate, idx ] = get_path_state(state.paths, path)
  const ret_path_state  = run_path_action(action, pstate, state)

  state.paths[idx] = [ path, ret_path_state ]
  state.status     = update_vm_status(state.status, ret_path_state)
  data.step        = step + 1
  data.commit_at   = stamp
  data.head        = get_commit_hash(data, input)

  if (ret_path_state === PathState.closed) {
    data.output = path
  }
}

function update_vm_status (
  status : PathStatus,
  state  : PathState
) : PathStatus {
  if (state === PathState.closed) {
    return 'closed'
  } else if (state === PathState.disputed) {
    return 'disputed'
  } else {
    return status
  }
}

function get_commit_hash (
  data  : CVMData,
  input : VMInput
) {
  const { head, step } = data
  const { stamp, wid } = input
  const output = data.output ?? 'null'
  return Buff.json([ wid, head, output, step, stamp ]).digest.hex
}

function check_update_stamp (
  data  : CVMData,
  stamp : number
) {
  if (stamp < data.commit_at) {
    throw new Error(`timestamp occurs before latest commit: ${stamp} < ${data.commit_at}`)
  }
}
