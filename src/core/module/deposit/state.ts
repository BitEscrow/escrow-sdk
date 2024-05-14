import { DepositData, DepositStatus } from '@/core/types/index.js'

import {
  INIT_CONF_STATE,
  INIT_SPEND_STATE,
  INIT_SETTLE_STATE
} from '@/core/lib/tx.js'
import { sort_record } from '@/core/util/base.js'

export const INIT_LOCK_STATE = () => {
  return {
    locked    : false as const,
    locked_at : null,
    covenant  : null
  }
}

export const INIT_CLOSE_STATE = () => {
  return {
    closed      : false as const,
    closed_at   : null,
    return_txid : null
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
  let preimage
  switch (status) {
    case 'registered':
      preimage = { ...rest, ...GET_REGISTER_STATE() }
      break
    case 'confirmed':
      preimage = { ...rest, ...GET_CONFIRMED_STATE() }
      break
    case 'locked':
      preimage = { ...rest, ...GET_LOCKED_STATE() }
      break
    case 'closed':
      preimage = { ...rest, ...GET_CLOSED_STATE() }
      break
    case 'spent':
      preimage = { ...rest, ...GET_SPEND_STATE() }
      break
    case 'settled':
      preimage = rest
      break
    default:
      throw new Error('unrecognized signature status: ' + status)
  }
  return JSON.stringify(sort_record(preimage))
}

export function get_deposit_stamp (
  deposit : DepositData,
  status  : DepositStatus
) {
  switch (status) {
    case 'registered':
      return deposit.created_at
    case 'confirmed':
      return deposit.block_time
    case 'locked':
      return deposit.locked_at
    case 'closed':
      return deposit.closed_at
    case 'spent':
      return deposit.spent_at
    case 'settled':
      return deposit.settled_at
    default:
      throw new Error('unrecognized signature status: ' + status)
  }
}
