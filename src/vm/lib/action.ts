/* Module Imports */

import { PathState, VMState } from '../types.js'
import { VMError }            from '../util/base.js'

export function run_path_action (
  action : string,
  pstate : PathState,
  state  : VMState
) : PathState {
  switch (action) {
    case 'close':
      return exec_close(pstate)
    case 'dispute':
      return exec_dispute(pstate)
    case 'lock':
      return exec_lock(pstate)
    case 'unlock':
      return exec_release(pstate)
    case 'resolve':
      return exec_resolve(state)
    default:
      throw new VMError('action not found')
  }
}

export function exec_dispute (state : PathState) {
  if (state === PathState.disputed) {
    throw new VMError('path is already in a dispute')
  }
  return PathState.disputed
}

export function exec_resolve (state : VMState) {
  if (state.status !== 'disputed') {
    throw new VMError('path is not in a dispute')
  }
  return PathState.closed
}

export function exec_lock (state : PathState) {
  if (state === PathState.locked) {
    throw new VMError('path is already locked')
  } else if (state === PathState.disputed) {
    throw new VMError('path is in a dispute')
  }
  return PathState.locked
}

export function exec_release (state : PathState) {
  if (state !== PathState.locked) {
    throw new VMError('path is not locked')
  }
  return PathState.open
}

function exec_close (state : PathState) {
  if (state === PathState.locked) {
    throw new VMError('path is locked')
  } else if (state === PathState.disputed) {
    throw new VMError('path is in a dispute')
  }
  return PathState.closed
}
