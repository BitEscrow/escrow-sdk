import { get_deposit_id } from './util.js'

import { assert, now, sort_record } from '../../util/index.js'

import {
  DepositData,
  DepositStatus,
  RegisterRequest,
  SignerAPI,
  TxIsConfirmed,
  CovenantData,
  DepositIsLocked,
  ConfirmState
} from '../../types/index.js'

import {
  get_account_ctx,
  get_account_hash,
  get_deposit_hash
} from '../account/util.js'

import {
  GET_INIT_RECV_STATE,
  GET_INIT_SPEND_STATE,
  get_satpoint,
  get_txid
} from '../../lib/tx.js'

/**
 * Initialization object for deposit data.
 */
const GET_INIT_DEPOSIT = () => {
  return {
    ...GET_INIT_RECV_STATE(),
    ...GET_INIT_SPEND_STATE(),
    locked      : false as const,
    locked_at   : null,
    covenant    : null,
    return_psig : null,
    status      : 'pending' as DepositStatus
  }
}

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
  const acct_hash  = get_account_hash(request)
  // Get the satpoint for the utxo.
  const satpoint   = get_satpoint(request.utxo)
  // Get the hash digest of the deposit request.
  const dp_hash    = get_deposit_hash(request)
  // Get the pubkey of the server's signing device.
  const server_pk  = signer.pubkey
  // Get the deposit id.
  const dpid       = get_deposit_id(created_at, dp_hash, server_pk)
  // Sign the deposit id.
  const server_sig = signer.sign(dpid)
  // Unpack our data objects into a template.
  const template   = { ...GET_INIT_DEPOSIT(), ...request }
  // Return a sorted object.
  return sort_record({
    ...template,
    acct_hash,
    created_at,
    deposit_addr,
    dpid,
    satpoint,
    server_pk,
    server_sig,
    updated_at : created_at
  })
}

export function confirm_deposit (
  deposit : DepositData,
  txstate : ConfirmState
) : DepositData & TxIsConfirmed {
  assert.ok(txstate.confirmed, 'transaction is not confirmed')
  const status = (!deposit.locked)
    ? 'open'   as DepositStatus
    : 'locked' as DepositStatus
  return { ...deposit, ...txstate, status }
}

export function lock_deposit (
  deposit  : DepositData,
  covenant : CovenantData,
  locked_at = now()
) : DepositData & DepositIsLocked {
  assert.ok(!deposit.locked, 'deposit is already locked')
  const status = 'locked' as DepositStatus
  return { ...deposit, locked: true, locked_at, covenant, status }
}

export function spend_deposit (
  deposit     : DepositData,
  spent_txhex : string,
  spent_at    = now()
) {
  const spent_txid = get_txid(spent_txhex)
  const status     = 'spent' as DepositStatus
  return { ...deposit, spent_at, status, spent_txhex, spent_txid, spent: true }
}
