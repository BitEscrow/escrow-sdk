import {
  PathState,
  VMData
} from '../types.js'

import { VMError } from '../util.js'

export function run_action (
  action : string,
  path   : PathState,
  state  : VMData
) : PathState | null {
  /**
   * Run an action on a specified path.
   */
  switch (action) {
    case 'close':
      return exec_close(path)
    case 'dispute':
      return exec_dispute(path)
    case 'lock':
      return exec_lock(path)
    case 'unlock':
      return exec_release(path)
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

export function exec_resolve (state : VMData) {
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
