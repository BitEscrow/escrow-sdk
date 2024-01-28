import { get_return_script } from './return.js'
import { validate_deposit }  from '@/validators/deposit.js'

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
  Network
} from '../types/index.js'

/**
 * Initialization object for deposit state.
 */
const GET_INIT_SPEND_STATE = () => {
  return {
    confirmed    : false as const,
    block_hash   : null,
    block_height : null,
    block_time   : null,
    expires_at   : null,
  }
}

/**
 * Initialization object for deposit data.
 */
const GET_INIT_DEPOSIT = () => {
  return {
    ...GET_INIT_SPEND_STATE(),
    covenant     : null,
    created_at   : now(),
    return_psig  : null,
    settled      : false as const,
    settled_at   : null,
    spent        : false as const,
    spent_at     : null,
    spent_txid   : null
  }
}

/**
 * Returns a new DepositData object from a partial template.
 */
export function create_deposit (
  template : Partial<DepositData>
) : DepositData {
  // Initialize our deposit object.
  const deposit = { ...GET_INIT_DEPOSIT(), ...template }
  // Initialize the updated date.
  deposit.updated_at = deposit.created_at
  // If deposit is confirmed:
  if (deposit.confirmed) {
    // If a covenant exists:
    if (deposit.covenant !== null) {
      // Set the deposit as locked.
      deposit.status = 'locked'
    } else {
      // Set the deposit as open.
      deposit.status = 'open'
    }
  } else {
    // Set the deposit as pending.
    deposit.status = 'pending'
  }
  // Validate the final object.
  validate_deposit(deposit)
  // Return a sorted object.
  return sort_record(deposit)
}

/**
 * Compute a context object for a deposit account.
 */
export function get_deposit_ctx (
  agent_pk   : string,
  deposit_pk : string,
  return_pk  : string,
  sequence   : number
) : DepositContext {
  // Define the members of the multi-sig.
  const members  = [ agent_pk, deposit_pk ]
  // Get the return script path.
  const script   = get_return_script(return_pk, sequence)
  // Get the musig context for the internal key.
  const int_data = get_key_ctx(members)
  // Get the key data for the taproot key.
  const tap_data = get_tapkey(int_data.group_pubkey.hex, script)
  // Get the musig context for the tap-tweaked key.
  const key_data = tweak_key_ctx(int_data, [ tap_data.taptweak ])
  // Return context object.
  return { agent_pk, deposit_pk, return_pk, sequence, script, tap_data, key_data }
}

/**
 * Derive an address from the deposit context.
 */
export function get_deposit_address (
  context  : DepositContext,
  network ?: Network
) {
  // Unpack the taproot data from the context.
  const { tap_data } = context
  // Compute the address for the taproot key.
  return get_address(tap_data.tapkey, network)
}

/**
 * Compute the spending state of a deposit,
 * using transaction data from an oracle.
 */
export function get_spend_state (
  sequence : number,
  txstatus : OracleTxStatus
) {
  // Initialize our spent state.
  let state : DepositState = GET_INIT_SPEND_STATE()
  // If transaction is confirmed:
  if (txstatus !== undefined && txstatus.confirmed) {
    // Parse the sequence value back into a timelock.
    const timelock   = parse_timelock(sequence)
    // Get the expiration date for the timelock.
    const expires_at = txstatus.block_time + timelock
    // Update the expiration date for the spend state.
    state  = { ...txstatus, expires_at }
  }
  // Return the spend state.
  return state
}
