import { sort_record }                from '@/core/util/base.js'
import { assert, parse_proof }        from '@/core/util/index.js'

import {
  DepositData,
  DepositPreImage,
  DepositStatus
} from '@/core/types/index.js'

import {
  INIT_CONF_STATE,
  INIT_SPEND_STATE,
  INIT_SETTLE_STATE
} from '@/core/lib/tx.js'

export const INIT_LOCK_STATE = () => {
  return {
    locked     : false as const,
    locked_at  : null,
    locked_sig : null,
    covenant   : null
  }
}

export const INIT_CLOSE_STATE = () => {
  return {
    closed       : false as const,
    closed_at    : null,
    closed_sig   : null,
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
    created_sig : null,
    status      : 'registered' as DepositStatus
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
    closed_sig : null,
    status     : 'closed' as DepositStatus
  }
}

export const GET_LOCKED_STATE = () => {
  return {
    ...GET_SPEND_STATE(),
    ...INIT_SPEND_STATE(),
    ...INIT_CONF_STATE(),
    locked_sig : null,
    status     : 'locked' as DepositStatus
  }
}

export const GET_SPEND_STATE = () => {
  return {
    ...INIT_SETTLE_STATE(),
    spent_sig : null,
    status    : 'spent' as DepositStatus
  }
}

export const GET_SETTLE_STATE = () => {
  return {
    settled_sig : null,
    status      : 'settled' as DepositStatus
  }
}

export function get_deposit_state (
  deposit : DepositPreImage,
  status  : DepositStatus
) {
  const { updated_at, ...rest } = deposit
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
      state = { ...rest, ...GET_SETTLE_STATE() }
      stamp = deposit.settled_at
      break
    default:
      throw new Error('unrecognized signature status: ' + status)
  }
  assert.exists(stamp)
  return { content: JSON.stringify(sort_record(state)), created_at: stamp }
}

export function get_deposit_proof (
  deposit : DepositData,
  status  : DepositStatus
) : { id : string, sig : string } {
  let sig
  switch (status) {
    case 'registered':
      sig = deposit.created_sig; break
    case 'locked':
      sig = deposit.locked_sig;  break
    case 'closed':
      sig = deposit.closed_sig;  break
    case 'spent':
      sig = deposit.spent_sig;   break
    case 'settled':
      sig = deposit.settled_sig; break
    default:
      throw new Error('unrecognized signature status: ' + status)
  }
  assert.exists(sig, 'deposit signature returned null for status: ' + status)
  const proof = parse_proof(sig)
  return { id: proof[0], sig: proof[1] }
}
