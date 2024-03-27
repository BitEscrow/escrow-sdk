/* Global Imports */
import { Buff } from '@cmdcode/buff'

/* Module Imports */

import { now, sort_record } from '@/util.js'

/* Local Imports */

import { get_account_ctx, get_account_hash } from './account.js'
import { create_covenant }                   from './covenant.js'
import { create_return_psig }                from './return.js'
import { get_utxo_bytes, parse_timelock }    from './tx.js'

import {
  AccountTemplate,
  CommitRequest,
  ContractData,
  DepositConfig,
  DepositData,
  DepositState,
  DepositStatus,
  LockRequest,
  OracleTxStatus,
  RegisterRequest,
  RegisterTemplate,
  SignerAPI,
  TxOutput
} from '../types/index.js'

import DepositSchema from '../schema/deposit.js'
import { sha512 } from '@cmdcode/crypto-tools/hash'

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
    spent_txid  : null,
    status      : 'pending' as DepositStatus
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
 * Returns a new DepositData object from a partial template.
 */
export function create_deposit (
  config  : DepositConfig,
  request : RegisterRequest | CommitRequest
) : DepositData {
  const { created_at = now(), utxo_state } = config
  // Create our deposit id.
  const dpid     = config.dpid ?? get_deposit_id(created_at, request)
  // Unpack our data objects into a template.
  const template = { ...GET_INIT_DEPOSIT(), ...request, ...utxo_state }
  // Get the deposit address from the account context.
  const { deposit_addr } = get_account_ctx(request)
  // Add remaining data to complete deposit object.
  const deposit = { ...template, deposit_addr, dpid, created_at, updated_at: created_at }
  // If deposit is confirmed:
  if (deposit.confirmed) {
    // If a covenant exists:
    if (deposit.covenant !== null) {
      // Set the deposit as locked.
      deposit.status = 'locked' as DepositStatus
    } else {
      // Set the deposit as open.
      deposit.status = 'open' as DepositStatus
    }
  }
  // Return a sorted object.
  return sort_record(deposit)
}

export function close_deposit (
  deposit    : DepositData,
  spent_at   : number,
  spent_txid : string
) {
  const status = 'spent' as DepositStatus
  return { ...deposit, spent_at, status, spent_txid, spent: true }
}

export function get_deposit_hash (
  request : RegisterTemplate | DepositData
) {
  const hash = get_account_hash(request)
  const agnt = Buff.hex(request.agent_tkn)
  const rate = Buff.num(request.feerate, 4)
  const utxo = get_utxo_bytes(request.utxo)
  const pimg = Buff.join([ hash, agnt, rate, utxo ])
  return sha512(pimg).hex
}

export function get_deposit_id (
  created_at : number,
  request    : RegisterRequest | CommitRequest
) {
  const hash = get_deposit_hash(request)
  const cat  = Buff.num(created_at, 4)
  return Buff.join([ hash, cat ]).digest.hex
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
