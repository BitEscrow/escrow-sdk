import { Network }           from '@scrow/tapscript'
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
  DepositStatus,
  DepositTemplate,
  OracleTxStatus,
  SpendOut,
} from '../types/index.js'

const INIT_STATE : DepositState = {
  confirmed    : false as const,
  block_hash   : null,
  block_height : null,
  block_time   : null,
  expires_at   : null
}

export const INIT_SPEND = {
  settled    : false as const,
  settled_at : null,
  spent      : false as const,
  spent_at   : null,
  spent_txid : null
}

export function register_deposit (
  context    : DepositContext,
  deposit_id : string,
  record_pn  : string,
  template   : DepositTemplate,
  txout      : SpendOut,
  txstate   ?: DepositState,
  created_at = now()
) : DepositData {
  /**
   * Initialize deposit with default values.
   */
  const { agent_key, deposit_key, sequence } = context

  const covenant   = template.covenant ?? null
  const updated_at = created_at
  const state      = txstate ?? { ...INIT_STATE }

  let status : DepositStatus = 'pending'

  if (state.confirmed) {
    status = 'open'
    if (template.covenant !== undefined) {
      status = 'locked'
    }
  }

  return sort_record({
    ...template, ...INIT_SPEND, ...state, ...txout, agent_key, created_at, 
    covenant, deposit_id, deposit_key, record_pn, sequence,status, updated_at
  })
}

export function get_deposit_ctx (
  agent_key   : string,
  deposit_key : string,
  sequence    : number
) : DepositContext {
  /**
   * Compute the context for a deposit.
   */
  const members  = [ deposit_key, agent_key ]
  const script   = get_return_script(deposit_key, sequence)
  const int_data = get_key_ctx(members)
  const tap_data = get_tapkey(int_data.group_pubkey.hex, script)
  const key_data = tweak_key_ctx(int_data, [ tap_data.taptweak ])

  return { agent_key, deposit_key, sequence, script, tap_data, key_data }
}

export function get_deposit_address (
  context  : DepositContext,
  network ?: Network
) {
  /**
   * Derive an address from deposit context.
   */
  const { tap_data } = context
  return get_address(tap_data.tapkey, network)
}

export function get_spend_state (
  sequence : number,
  txstatus : OracleTxStatus
) {
  /**
   * Compute the spending state of a deposit
   * from the received oracle data.
   */
  let state : DepositState = INIT_STATE

  if (txstatus !== undefined && txstatus.confirmed) {
    const timelock   = parse_timelock(sequence)
    const expires_at = txstatus.block_time + timelock
    state  = { ...txstatus, expires_at }
  }

  return state
}
