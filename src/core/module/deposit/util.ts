import { Buff }              from '@cmdcode/buff'
import { verify_sig }        from '@cmdcode/crypto-tools/signer'
import { INIT_CONF_STATE }   from '@/core/lib/tx.js'
import { DEPOSIT_KIND }      from '@/core/const.js'
import { sort_record }       from '@/core/util/base.js'
import { get_deposit_state } from './state.js'
import * as assert           from '@/core/util/assert.js'

import { get_proof_id, parse_proof, update_proof } from '@/core/util/notarize.js'

import {
  DepositData,
  DepositStatus,
  NoteTemplate,
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

export function get_deposit_preimg (
  deposit : DepositData,
  status  : DepositStatus
) : NoteTemplate {
  const { dpid, server_pk: pubkey } = deposit
  const { content, created_at }    = get_deposit_state(deposit, status)
  const kind  = DEPOSIT_KIND
  const tags  = [ [ 'i', dpid ] ]
  return { content, created_at, kind, pubkey, tags }
}

export function get_deposit_note (
  deposit : DepositData,
  status  : DepositStatus
) {
  const tmpl  = get_deposit_preimg(deposit, status)
  const proof = deposit.sigs.find(e => e[0] === status)
  assert.exists(proof, 'signature no found for status: ' + status)
  const id  = proof[1].slice(0, 64)
  const sig = proof[1].slice(64)
  return { ...tmpl, id, sig }
}

export function notarize_deposit (
  deposit : DepositData,
  signer  : SignerAPI,
  status  : DepositStatus
) : ProofEntry<DepositStatus> {
  const img = get_deposit_preimg(deposit, status)
  const dig = get_proof_id(img)
  const sig = signer.sign(dig)
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
  const img = get_deposit_preimg(deposit, status)
  const dig = get_proof_id(img)
  assert.ok(pubkey === pub,           'pubkey does not match: ' + status)
  assert.ok(dig === id,               'digest does not match: ' + status)
  assert.ok(verify_sig(sig, id, pub), 'invalid signature: '     + status)
}
