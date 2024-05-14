import { Buff }            from '@cmdcode/buff'
import { verify_sig }      from '@cmdcode/crypto-tools/signer'
import { INIT_CONF_STATE } from '@/core/lib/tx.js'
import { DEPOSIT_KIND }    from '@/core/const.js'
import { sort_record }     from '@/core/util/base.js'
import * as assert         from '@/core/util/assert.js'

import { get_deposit_stamp, get_deposit_state } from './state.js'

import { get_proof_id, parse_proof, update_proof } from '@/core/util/notarize.js'

import {
  DepositData,
  DepositStatus,
  OracleTxSpendData,
  ProofEntry,
  SignerAPI,
  TxConfirmState
} from '@/core/types/index.js'

export function get_deposit_id (
  created_at : number,
  dep_hash   : string
) : string {
  const cat  = Buff.num(created_at, 4)
  const hash = Buff.hex(dep_hash, 64)
  return Buff.join([ cat, hash ]).digest.hex
}

/**
 * Compute the spending state of a deposit,
 * using transaction data from an oracle.
 */
export function get_confirm_state (
  locktime  : number,
  utxo_data : OracleTxSpendData
) : TxConfirmState {
  const { status } = utxo_data
  if (status.confirmed) {
      const expires_at = status.block_time + locktime
      return { ...status, expires_at }
  } else {
    return INIT_CONF_STATE()
  }
}

export function get_deposit_digest (
  deposit : DepositData,
  status  : DepositStatus
) {
  const { dpid, server_pk } = deposit
  const stamp = get_deposit_stamp(deposit, status)
  const state = get_deposit_state(deposit, status)
  const tags  = [ [ 'i', dpid ] ]
  assert.exists(stamp, 'timestamp is null: ' + status)
  return get_proof_id(state, DEPOSIT_KIND, server_pk, stamp, tags)
}

export function notarize_deposit (
  deposit : DepositData,
  signer  : SignerAPI,
  status  : DepositStatus
) : ProofEntry<DepositStatus> {
  const dig    = get_deposit_digest(deposit, status)
  const sig    = signer.sign(dig)
  return [ status, Buff.join([ dig, sig ]).hex ]
}

export function update_deposit (
  deposit : DepositData,
  signer  : SignerAPI,
  status  : DepositStatus
) {
  const proof  = notarize_deposit(deposit, signer, status)
  deposit.sigs = update_proof(deposit.sigs, proof)
  return sort_record(deposit)
}

export function verify_deposit_sig (
  deposit   : DepositData,
  pubkey    : string,
  signature : ProofEntry<DepositStatus>
) {
  const [ status, proof ] = signature
  const [ id, sig ]       = parse_proof(proof)
  const pub = deposit.server_pk
  const dig = get_deposit_digest(deposit, status)
  assert.ok(pubkey === pub,           'pubkey does not match: ' + status)
  assert.ok(dig === id,               'digest does not match: ' + status)
  assert.ok(verify_sig(sig, id, pub), 'invalid signature: '     + status)
}
