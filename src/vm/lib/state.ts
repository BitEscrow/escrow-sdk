import { Buff }            from '@cmdcode/buff'
import { ProgramEntry }    from '@/core/types/index.js'
import { VMError }         from '../util/base.js'
import { run_path_action } from './action.js'
import { PATH_ACTIONS }    from '../const.js'
import { assert }          from '@/core/util/index.js'

import {
  CVMData,
  PathStateEntry,
  VMInput
} from '../types/index.js'

import {
  get_path_state,
  init_path_state,
  update_path_vm_status
} from './path.js'

export function init_vm_state (
  paths    : string[],
  programs : ProgramEntry[]
) {
  const states : PathStateEntry[] = []
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
  const { state, step }         = data

  if (action === 'close') {
    state.status = 'closed'
  } else if (PATH_ACTIONS.includes(action)) {
    assert.exists(path, 'path value is null')
    const [ path_state, path_idx ] = get_path_state(state.paths, path)
    const ret_path_state  = run_path_action(action, path_state, state)
    state.paths[path_idx] = [ path, ret_path_state ]
    state.status = update_path_vm_status(state.status, ret_path_state)
  } else {
    throw new Error('unrecognized action: ' + action)
  }

  data.step        = step + 1
  data.commit_at   = stamp
  data.head        = get_commit_hash(data, input)

  if (state.status === 'closed' || state.status === 'spent') {
    data.closed    = true
    data.closed_at = stamp
    data.output    = path
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
    throw new VMError(`timestamp occurs before latest commit: ${stamp} < ${data.commit_at}`)
  } else if (stamp >= data.expires_at) {
    throw new VMError(`timestamp occurs on or after expiration date: ${stamp} >= ${data.expires_at}`)
  }
}
