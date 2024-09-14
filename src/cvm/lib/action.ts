import { VMError } from '../util/base.js'

import { PathStateEnum, CVMState } from '../types/index.js'

export function run_path_action (
  action : string,
  pstate : PathStateEnum,
  state  : CVMState
) : PathStateEnum {
  switch (action) {
    case 'spend':
      return exec_spend(pstate)
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

export function exec_dispute (state : PathStateEnum) {
  if (state === PathStateEnum.disputed) {
    throw new VMError('path is already in a dispute')
  }
  return PathStateEnum.disputed
}

export function exec_resolve (state : CVMState) {
  if (state.status !== 'disputed') {
    throw new VMError('path is not in a dispute')
  }
  return PathStateEnum.spent
}

export function exec_lock (state : PathStateEnum) {
  if (state === PathStateEnum.locked) {
    throw new VMError('path is already locked')
  } else if (state === PathStateEnum.disputed) {
    throw new VMError('path is in a dispute')
  }
  return PathStateEnum.locked
}

export function exec_release (state : PathStateEnum) {
  if (state !== PathStateEnum.locked) {
    throw new VMError('path is not locked')
  }
  return PathStateEnum.open
}

function exec_spend (state : PathStateEnum) {
  if (state === PathStateEnum.locked) {
    throw new VMError('path is locked')
  } else if (state === PathStateEnum.disputed) {
    throw new VMError('path is in a dispute')
  }
  return PathStateEnum.spent
}
