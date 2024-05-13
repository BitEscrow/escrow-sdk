import { assert, now, sort_record } from '../../util/index.js'
import { GET_REGISTER_STATE }       from './state.js'

import {
  DepositData,
  DepositStatus,
  RegisterRequest,
  SignerAPI,
  CovenantData,
  TxConfirmState
} from '../../types/index.js'

import {
  get_account_ctx,
  get_account_hash,
  get_deposit_hash
} from '../account/util.js'

import {
  get_satpoint,
  get_txid
} from '../../lib/tx.js'

import {
  get_deposit_id,
  update_deposit
} from './util.js'

/**
 * Returns a new DepositData object from a partial template.
 */
export function create_deposit (
  request : RegisterRequest,
  signer  : SignerAPI,
  created_at = now()
) : DepositData {
  // Get the deposit address from the account context.
  const { deposit_addr } = get_account_ctx(request)
  // Compute the hash for the account request.
  const acct_hash = get_account_hash(request)
  // Get the satpoint for the utxo.
  const satpoint  = get_satpoint(request.utxo)
  // Get the hash digest of the deposit request.
  const dp_hash   = get_deposit_hash(request)
  // Get the deposit id.
  const dpid      = get_deposit_id(created_at, dp_hash)
  // Return a sorted object.
  const template = {
    ...GET_REGISTER_STATE(),
    ...request,
    acct_hash,
    created_at,
    deposit_addr,
    dpid,
    satpoint,
    server_pk  : signer.pubkey,
    sigs       : [],
    updated_at : created_at
  }
  return update_deposit(template, signer, 'registered')
}

export function confirm_deposit (
  deposit : DepositData,
  txstate : TxConfirmState,
  signer  : SignerAPI
) : DepositData {
  assert.ok(!deposit.confirmed, 'deposit is already confirmed')
  assert.ok(txstate.confirmed,  'transaction is not confirmed')
  const status = (!deposit.locked)
    ? 'confirmed' as DepositStatus
    : 'locked'    as DepositStatus
  const updated = { ...deposit, ...txstate, status, updated_at: txstate.block_time }
  return update_deposit(updated, signer, status)
}

export function close_deposit (
  deposit     : DepositData,
  return_txid : string,
  signer      : SignerAPI,
  closed_at   = now()
) {
  assert.ok(deposit.confirmed, 'deposit is not confirmed')
  assert.ok(!deposit.locked,   'deposit is already locked')
  assert.ok(!deposit.closed,   'deposit is already closed')
  assert.ok(!deposit.spent,    'deposit is already spent')
  const closed  = true as const
  const status  = 'closed' as DepositStatus
  const changes = { closed, closed_at, return_txid }
  const updated = { ...deposit, ...changes, status, updated_at: closed_at }
  return update_deposit(updated, signer, status)
}

export function lock_deposit (
  deposit  : DepositData,
  covenant : CovenantData,
  signer   : SignerAPI,
  locked_at = now()
) : DepositData {
  assert.ok(!deposit.locked, 'deposit is already locked')
  assert.ok(!deposit.closed, 'deposit is already closed')
  assert.ok(!deposit.spent,  'deposit is already spent')
  const locked  = true as const
  const status  = 'locked' as DepositStatus
  const changes = { locked, locked_at, covenant }
  const updated = { ...deposit, ...changes, status, updated_at: locked_at }
  return update_deposit(updated, signer, status)
}

export function release_deposit (
  deposit : DepositData,
  updated_at = now()
) : DepositData {
  assert.ok(deposit.locked,  'deposit is not locked')
  assert.ok(!deposit.closed, 'deposit is already closed')
  assert.ok(!deposit.spent,  'deposit is already spent')
  const sigs   = deposit.sigs.filter(e => e[0] !== 'locked')
  const status = (deposit.confirmed)
    ? 'confirmed'  as DepositStatus
    : 'registered' as DepositStatus
  const changes = { locked: false as const, locked_at: null, covenant: null, sigs }
  return sort_record({ ...deposit, ...changes, status, updated_at })
}

export function spend_deposit (
  deposit     : DepositData,
  spent_txhex : string,
  signer      : SignerAPI,
  spent_at    = now()
) : DepositData {
  assert.ok(deposit.confirmed, 'deposit is not confirmed')
  assert.ok(!deposit.spent,    'deposit is already spent')
  const spent = true as const
  const spent_txid = get_txid(spent_txhex)
  const status     = 'spent' as DepositStatus
  const changes    = { spent, spent_txhex, spent_txid, spent_at }
  const updated    = { ...deposit, ...changes, status, updated_at: spent_at }
  return update_deposit(updated, signer, status)
}

export function settle_deposit (
  deposit : DepositData,
  signer  : SignerAPI,
  settled_at = now()
) {
  assert.ok(deposit.confirmed,               'deposit is not confirmed')
  assert.ok(deposit.spent || deposit.closed, 'deposit is not settled')
  const settled = true as const
  const status  = 'settled' as DepositStatus
  const changes = { settled, settled_at }
  const updated = { ...deposit, ...changes, status, updated_at: settled_at }
  return update_deposit(updated, signer, status)
}
