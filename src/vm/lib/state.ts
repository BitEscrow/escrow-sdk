/* Global Imports */

import { Buff }         from '@cmdcode/buff'
import { ProgramEntry } from '@/core/types/index.js'

import {
  PathState,
  PathStatus,
  StateEntry,
  VMInput,
  VMState
} from '../types.js'

/* Local Imports */

import { run_path_action } from './action.js'

import {
  get_path_state,
  init_path_state
} from './path.js'

export function init_spend_state (
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

export function update_spend_state (
  input : VMInput,
  state : VMState
) {
  check_update_stamp(input.stamp, state)

  const { action, path, stamp } = input
  const [ pstate, idx ]  = get_path_state(state.paths, path)
  const ret_path_state   = run_path_action(action, pstate, state)

  state.paths[idx] = [ path, ret_path_state ]
  state.status     = update_vm_status(state.status, ret_path_state)
  state.step       = state.step + 1
  state.updated_at = stamp
  state.head       = get_commit_hash(input, state)

  if (ret_path_state === PathState.closed) {
    state.output = path
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
  input : VMInput,
  state : VMState
) {
  const { head, status, step, updated_at } = state
  return Buff.json([ input.wid, head, status, step, updated_at ]).digest.hex
}

function check_update_stamp (
  stamp : number,
  state : VMState
) {
  if (stamp < state.updated_at) {
    throw new Error(`timestamp occurs before latest update: ${stamp} < ${state.updated_at}`)
  }
}
