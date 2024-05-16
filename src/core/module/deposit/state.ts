import { DepositData, DepositStatus } from '@/core/types/index.js'

import {
  INIT_CONF_STATE,
  INIT_SPEND_STATE,
  INIT_SETTLE_STATE
} from '@/core/lib/tx.js'
import { sort_record } from '@/core/util/base.js'
import { assert } from '@/core/util/index.js'

export const INIT_LOCK_STATE = () => {
  return {
    locked    : false as const,
    locked_at : null,
    covenant  : null
  }
}

export const INIT_CLOSE_STATE = () => {
  return {
    closed       : false as const,
    closed_at    : null,
    return_txhex : null,
    return_txid  : null
  }
}

export const GET_REGISTER_STATE = () => {
  return {
    ...INIT_CONF_STATE(),
    ...INIT_CLOSE_STATE(),
    ...INIT_LOCK_STATE(),
    ...INIT_SPEND_STATE(),
    ...INIT_SETTLE_STATE(),
    status : 'registered' as DepositStatus
  }
}

export const GET_CONFIRMED_STATE = () => {
  return {
    ...INIT_SPEND_STATE(),
    ...INIT_LOCK_STATE(),
    status : 'confirmed' as DepositStatus
  }
}

export const GET_CLOSED_STATE = () => {
  return {
    ...INIT_SETTLE_STATE(),
    status : 'closed' as DepositStatus
  }
}

export const GET_LOCKED_STATE = () => {
  return {
    ...GET_SPEND_STATE(),
    ...INIT_SPEND_STATE(),
    ...INIT_CONF_STATE(),
    status : 'locked' as DepositStatus
  }
}

export const GET_SPEND_STATE = () => {
  return {
    ...INIT_SETTLE_STATE(),
    status : 'spent' as DepositStatus
  }
}

export function get_deposit_state (
  deposit : DepositData,
  status  : DepositStatus
) {
  const { sigs, updated_at, ...rest } = deposit
  let state, stamp
  switch (status) {
    case 'registered':
      state = { ...rest, ...GET_REGISTER_STATE() }
      stamp = deposit.created_at
      break
    case 'confirmed':
      state = { ...rest, ...GET_CONFIRMED_STATE() }
      stamp = deposit.block_time
      break
    case 'locked':
      state = { ...rest, ...GET_LOCKED_STATE() }
      stamp = deposit.locked_at
      break
    case 'closed':
      state = { ...rest, ...GET_CLOSED_STATE() }
      stamp = deposit.closed_at
      break
    case 'spent':
      state = { ...rest, ...GET_SPEND_STATE() }
      stamp = deposit.spent_at
      break
    case 'settled':
      state = rest
      stamp = deposit.settled_at
      break
    default:
      throw new Error('unrecognized signature status: ' + status)
  }
  assert.exists(stamp)
  return { content: JSON.stringify(sort_record(state)), created_at: stamp }
}
