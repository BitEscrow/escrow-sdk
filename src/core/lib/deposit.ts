/* Global Imports */

import { Buff } from '@cmdcode/buff'

/* Module Imports */

import { assert, now, sort_record } from '../util/index.js'

import {
  AccountTemplate,
  CloseRequest,
  CommitRequest,
  ContractData,
  DepositConfig,
  DepositData,
  DepositStatus,
  LockRequest,
  OracleTxRecvStatus,
  RegisterRequest,
  SignerAPI,
  TxOutput,
  TxConfirmedState
} from '../types/index.js'

import DepositSchema from '../schema/deposit.js'

/* Local Imports */

import { create_covenant }    from './covenant.js'
import { create_return_psig } from './return.js'

import {
  get_account_ctx,
  get_account_hash,
  get_deposit_hash
} from './account.js'

import {
  GET_INIT_RECV_STATE,
  GET_INIT_SPEND_STATE,
  get_satpoint,
  get_txid
} from './tx.js'

/**
 * Initialization object for deposit data.
 */
const GET_INIT_DEPOSIT = () => {
  return {
    ...GET_INIT_RECV_STATE(),
    ...GET_INIT_SPEND_STATE(),
    covenant    : null,
    return_psig : null
  }
}

/**
 * Create a registration request object.
 */
export function create_register_req (
  feerate   : number,
  request   : AccountTemplate,
  signer    : SignerAPI,
  utxo      : TxOutput
) : RegisterRequest {
  const registration = { ...request, feerate, utxo }
  const return_psig  = create_return_psig(registration, signer)
  // Parse and return a valid register request object.
  return DepositSchema.register_req.parse({ ...registration, return_psig })
}

/**
 * Create a registration request object.
 */
export function create_commit_req (
  feerate  : number,
  contract : ContractData,
  request  : AccountTemplate,
  signer   : SignerAPI,
  utxo     : TxOutput
) : CommitRequest {
  const registration = create_register_req(feerate, request, signer, utxo)
  const covenant     = create_covenant(contract, registration, signer)
  // Parse and return a valid register request object.
  return DepositSchema.commit_req.parse({ ...registration, covenant })
}

/**
 * Create a lock request object.
 */
export function create_lock_req (
  contract : ContractData,
  deposit  : DepositData,
  signer   : SignerAPI
) : LockRequest {
  const dpid     = deposit.dpid
  const covenant = create_covenant(contract, deposit, signer)
  // Parse and return a valid register request object.
  return DepositSchema.lock_req.parse({ dpid, covenant })
}

/**
 * Create a lock request object.
 */
export function create_close_req (
  deposit  : DepositData,
  feerate  : number,
  signer   : SignerAPI
) : CloseRequest {
  const dpid = deposit.dpid
  const ctx  = { ...deposit, feerate }
  const return_psig = create_return_psig(ctx, signer)
  // Parse and return a valid register request object.
  return DepositSchema.close_req.parse({ dpid, feerate, return_psig })
}

/**
 * Returns a new DepositData object from a partial template.
 */
export function create_deposit (
  request : RegisterRequest | CommitRequest,
  signer  : SignerAPI,
  options : DepositConfig = {}
) : DepositData {
  //
  const { created_at = now(), utxo_state } = options
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
  const template   = { ...GET_INIT_DEPOSIT(), ...request, ...utxo_state }
  // Set the initial status of the deposit.
  const status     = (template.covenant !== null)
    ? 'locked'     as DepositStatus
    : (template.confirmed)
      ? 'open'     as DepositStatus
      : 'pending'  as DepositStatus
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
    status,
    updated_at : created_at
  })
}

export function close_deposit (
  deposit     : DepositData,
  spent_txhex : string,
  spent_at    = now()
) {
  const spent_txid = get_txid(spent_txhex)
  const status     = 'spent' as DepositStatus
  return { ...deposit, spent_at, status, spent_txhex, spent_txid, spent: true }
}

export function get_deposit_id (
  created_at : number,
  dep_hash   : string,
  pubkey     : string
) {
  const cat  = Buff.num(created_at, 4)
  const hash = Buff.hex(dep_hash, 64)
  const pub  = Buff.hex(pubkey, 32)
  return Buff.join([ cat, hash, pub ]).digest.hex
}

/**
 * Compute the spending state of a deposit,
 * using transaction data from an oracle.
 */
export function get_confirm_state (
  locktime : number,
  txstatus : OracleTxRecvStatus
) : TxConfirmedState {
  assert.ok(txstatus.confirmed)
  const expires_at = txstatus.block_time + locktime
  return { ...txstatus, expires_at }
}
