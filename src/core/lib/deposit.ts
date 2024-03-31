/* Global Imports */

import { Buff } from '@cmdcode/buff'

/* Module Imports */

import { now, sort_record } from '../util/index.js'

import {
  AccountTemplate,
  CloseRequest,
  CommitRequest,
  ContractData,
  DepositConfig,
  DepositData,
  DepositState,
  DepositStatus,
  LockRequest,
  OracleTxStatus,
  RegisterRequest,
  SignerAPI,
  TxOutput
} from '../types/index.js'

import DepositSchema from '../schema/deposit.js'

/* Local Imports */

import { create_covenant }    from './covenant.js'
import { create_return_psig } from './return.js'
import { parse_timelock }     from './tx.js'

import { get_account_ctx, get_deposit_hash } from './account.js'

/**
 * Initialization object for deposit state.
 */
const GET_INIT_SPEND_STATE = () => {
  return {
    confirmed    : false as const,
    block_hash   : null,
    block_height : null,
    block_time   : null,
    expires_at   : null
  }
}

/**
 * Initialization object for deposit data.
 */
const GET_INIT_DEPOSIT = () => {
  return {
    ...GET_INIT_SPEND_STATE(),
    covenant    : null,
    return_psig : null,
    settled     : false as const,
    settled_at  : null,
    spent       : false as const,
    spent_at    : null,
    spent_txid  : null
  }
}

/**
 * Create a registration request object.
 */
export function create_register_req (
  feerate  : number,
  request  : AccountTemplate,
  signer   : SignerAPI,
  utxo     : TxOutput
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
  config  : DepositConfig,
  request : RegisterRequest | CommitRequest,
  signer  : SignerAPI
) : DepositData {
  //
  const { created_at = now(), utxo_state } = config
  // Get the deposit address from the account context.
  const { deposit_addr } = get_account_ctx(request)
  //
  const req_hash   = config.req_hash ?? get_deposit_hash(request)
  //
  const server_pk  = signer.pubkey
  // Create our deposit id.
  const dpid       = config.dpid ?? get_deposit_id(created_at, req_hash, server_pk)
  //
  const server_sig = signer.sign(dpid)
  // Unpack our data objects into a template.
  const template   = { ...GET_INIT_DEPOSIT(), ...request, ...utxo_state }
  //
  const status     = (template.confirmed)
    ? (template.covenant !== null)
      ? 'locked' as DepositStatus
      : 'open'   as DepositStatus
    : 'pending'  as DepositStatus
  // Return a sorted object.
  return sort_record({
    ...template,
    created_at,
    deposit_addr,
    dpid,
    server_pk,
    server_sig,
    status,
    updated_at : created_at
  })
}

export function close_deposit (
  deposit    : DepositData,
  spent_at   : number,
  spent_txid : string
) {
  const status = 'spent' as DepositStatus
  return { ...deposit, spent_at, status, spent_txid, spent: true }
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
