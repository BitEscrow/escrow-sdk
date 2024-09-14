import { assert, now, sort_record } from '@/util/index.js'

import TxSchema from '@/core/schema/tx.js'

import {
  GET_REGISTER_STATE,
  INIT_LOCK_STATE
} from './state.js'

import {
  DepositData,
  DepositStatus,
  RegisterRequest,
  SignerAPI,
  CovenantData,
  TxStatus
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
  notarize_deposit
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
  // Get the hash digest of the deposit request.
  const dp_hash  = get_deposit_hash(request)
  // Return a sorted object.
  const template = {
    ...GET_REGISTER_STATE(),
    ...request,
    account_hash : get_account_hash(request),
    agent_pk     : signer.pubkey,
    created_at,
    deposit_addr,
    dpid         : get_deposit_id(created_at, dp_hash),
    satpoint     : get_satpoint(request.utxo),
    updated_at   : created_at
  }
  const proof = notarize_deposit(template, signer, 'registered')
  return sort_record({ ...template, created_sig: proof })
}

export function confirm_deposit (
  deposit  : DepositData,
  txstatus : TxStatus
) : DepositData {
  assert.ok(!deposit.confirmed, 'deposit is already confirmed')
  assert.ok(txstatus.confirmed,  'transaction is not confirmed')
  const parsed       = TxSchema.oracle_conf.parse(txstatus)
  const confirmed    = true as const
  const confirmed_at = parsed.block_time
  const conf_block   = parsed.block_hash
  const conf_height  = parsed.block_height
  const expires_at   = parsed.block_time + deposit.locktime
  const status       = (!deposit.locked)
    ? 'open'   as DepositStatus
    : 'locked' as DepositStatus
  const changes = { confirmed, confirmed_at, conf_block, conf_height, expires_at }
  const updated = { ...deposit, ...changes, status, updated_at: confirmed_at }
  return sort_record(updated)
}

export function close_deposit (
  deposit : DepositData,
  signer  : SignerAPI,
  txhex   : string,
  closed_at = now()
) {
  assert.ok(deposit.confirmed, 'deposit is not confirmed')
  assert.ok(!deposit.locked,   'deposit is already locked')
  assert.ok(!deposit.closed,   'deposit is already closed')
  assert.ok(!deposit.spent,    'deposit is already spent')
  const txid    = get_txid(txhex)
  const closed  = true as const
  const status  = 'closed' as DepositStatus
  const changes = { closed, closed_at, return_txid: txid, return_txhex: txhex }
  const updated = { ...deposit, ...changes, status, updated_at: closed_at }
  const proof   = notarize_deposit(updated, signer, status)
  return sort_record({ ...updated, closed_sig: proof })
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
  const proof   = notarize_deposit(updated, signer, status)
  return sort_record({ ...updated, locked_sig: proof })
}

export function release_deposit (
  deposit : DepositData,
  updated_at = now()
) : DepositData {
  assert.ok(deposit.locked,  'deposit is not locked')
  assert.ok(!deposit.closed, 'deposit is already closed')
  assert.ok(!deposit.spent,  'deposit is already spent')
  const status = (deposit.confirmed)
    ? 'open'       as DepositStatus
    : 'registered' as DepositStatus
  const changes = INIT_LOCK_STATE()
  return sort_record({ ...deposit, ...changes, status, updated_at })
}

export function spend_deposit (
  deposit : DepositData,
  txhex   : string,
  signer  : SignerAPI,
  spent_at = now()
) : DepositData {
  assert.ok(deposit.confirmed, 'deposit is not confirmed')
  assert.ok(!deposit.spent,    'deposit is already spent')
  const spent   = true as const
  const txid    = get_txid(txhex)
  const status  = 'spent' as DepositStatus
  const changes = { spent, spent_txhex: txhex, spent_txid: txid, spent_at }
  const updated = { ...deposit, ...changes, status, updated_at: spent_at }
  const proof   = notarize_deposit(updated, signer, status)
  return sort_record({ ...updated, spent_sig: proof })
}

export function settle_deposit (
  deposit  : DepositData,
  signer   : SignerAPI,
  txstatus : TxStatus
) {
  assert.ok(deposit.confirmed,               'deposit is not confirmed')
  assert.ok(deposit.spent || deposit.closed, 'deposit is not settled')
  const parsed       = TxSchema.oracle_conf.parse(txstatus)
  const settled      = true as const
  const settled_at   = parsed.block_time
  const spent_block  = parsed.block_hash
  const spent_height = parsed.block_height
  const changes      = { settled, settled_at, spent_block, spent_height }
  const status       = 'settled' as DepositStatus
  const updated      = { ...deposit, ...changes, status, updated_at: settled_at }
  const proof        = notarize_deposit(updated, signer, status)
  return sort_record({ ...updated, settled_sig: proof })
}
