import { Network }           from '@scrow/tapscript'
import { parse_deposit }     from './parse.js'
import { get_return_script } from './return.js'

import {
  now,
  sort_record
} from './util.js'

import {
  get_key_ctx,
  tweak_key_ctx
} from '@cmdcode/musig2'

import {
  get_address,
  get_tapkey,
  parse_timelock
} from './tx.js'

import {
  DepositContext,
  DepositData,
  DepositState,
  OracleTxStatus,
} from '../types/index.js'

/**
 * Initialization object for deposit state.
 */
const INIT_STATE = {
  confirmed    : false as const,
  block_hash   : null,
  block_height : null,
  block_time   : null,
  expires_at   : null,
}

/**
 * Initialization object for deposit data.
 */
const INIT_DEPOSIT = {
  ...INIT_STATE,
  covenant     : null,
  created_at   : now(),
  settled      : false as const,
  settled_at   : null,
  spent        : false as const,
  spent_at     : null,
  spent_txid   : null
}

/**
 * Returns a new DepositData object from a partial template.
 */
export function create_deposit (
  template : Partial<DepositData>
) : DepositData {
  const deposit = { ...INIT_DEPOSIT, ...template }

  deposit.updated_at = deposit.created_at

  if (deposit.confirmed) {
    deposit.status = (deposit.covenant !== null)
     ? 'locked'
     : 'open'
  } else {
    deposit.status = 'pending'
  }

  const parsed = parse_deposit(deposit)
  return sort_record(parsed)
}

/**
 * Compute a context object for a deposit account.
 */
export function get_deposit_ctx (
  agent_pk  : string,
  member_pk : string,
  sequence  : number
) : DepositContext {
  const members  = [ member_pk, agent_pk ]
  const script   = get_return_script(member_pk, sequence)
  const int_data = get_key_ctx(members)
  const tap_data = get_tapkey(int_data.group_pubkey.hex, script)
  const key_data = tweak_key_ctx(int_data, [ tap_data.taptweak ])

  return { agent_pk, member_pk, sequence, script, tap_data, key_data }
}

/**
 * Derive an address from the deposit context.
 */
export function get_deposit_address (
  context  : DepositContext,
  network ?: Network
) {
  const { tap_data } = context
  return get_address(tap_data.tapkey, network)
}

/**
 * Compute the spend state of a deposit
 * using the data received from an oracle.
 */
export function get_spend_state (
  sequence : number,
  txstatus : OracleTxStatus
) {
  let state : DepositState = INIT_STATE

  if (txstatus !== undefined && txstatus.confirmed) {
    const timelock   = parse_timelock(sequence)
    const expires_at = txstatus.block_time + timelock
    state  = { ...txstatus, expires_at }
  }

  return state
}
