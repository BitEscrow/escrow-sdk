import { parse_script }   from '@scrow/tapscript/script'
import { parse_sequence } from '@scrow/tapscript/tx'
import { verify_sig }     from '@cmdcode/crypto-tools/signer'

import * as assert      from '@/assert.js'
import { ServerPolicy } from '@/types.js'

import { get_account_ctx }      from '../lib/account.js'
import { verify_account_req }   from './account.js'
import { verify_covenant }      from './covenant.js'
import { verify_return_psig }   from './return.js'
import { verify_session_token } from './session.js'

import {
  get_deposit_hash,
  get_deposit_id
} from '../lib/deposit.js'

import {
  CloseRequest,
  CommitRequest,
  ContractData,
  DepositData,
  DepositStatus,
  LockRequest,
  RegisterRequest,
  SignerAPI
} from '../types/index.js'

import DepositSchema from '../schema/deposit.js'

export function validate_register_req (
  request : unknown
) : asserts request is RegisterRequest {
  void DepositSchema.register_req.parse(request)
}

export function validate_commit_req (
  request : unknown
) : asserts request is CommitRequest {
  void DepositSchema.commit_req.parse(request)
}

export function validate_lock_req (
  request : unknown
) : asserts request is CommitRequest {
  void DepositSchema.lock_req.parse(request)
}

export function validate_close_req (
  request : unknown
) : asserts request is CommitRequest {
  void DepositSchema.close_req.parse(request)
}

export function validate_deposit (
  deposit : Record<string, any>
) : asserts deposit is DepositData {
  DepositSchema.data.parse(deposit)
}

export function verify_register_req (
  policy  : ServerPolicy,
  request : RegisterRequest,
  signer  : SignerAPI
) {
  const psig = request.return_psig
  verify_feerate(request.feerate, policy)
  // Verify the account details.
  verify_account_req(policy, request)
  // Verify the session token.
  verify_session_token(request, signer)
  // Verify the return psig.
  verify_return_psig(request, psig)
  // Verify the utxo.
  verify_utxo(request)
}

export function verify_commit_req (
  contract  : ContractData,
  policy    : ServerPolicy,
  request   : CommitRequest,
  server_sd : SignerAPI
) {
  const covenant = request.covenant
  verify_register_req(policy, request, server_sd)
  verify_covenant(contract, covenant, request, server_sd)
}

export function verify_lock_req (
  contract  : ContractData,
  deposit   : DepositData,
  request   : LockRequest,
  server_sd : SignerAPI
) {
  assert.ok(request.dpid === deposit.dpid)
  assert.ok(deposit.covenant === null)
  const covenant = request.covenant
  verify_lockable(deposit.status)
  verify_covenant(contract, covenant, deposit, server_sd)
}

export function verify_close_req (
  deposit : DepositData,
  policy  : ServerPolicy,
  request : CloseRequest
) {
  const psig = request.return_psig
  assert.ok(request.dpid === deposit.dpid)
  assert.ok(deposit.covenant === null)
  verify_feerate(request.feerate, policy)
  // Verify the return psig.
  verify_return_psig(deposit, psig)
}

export function verify_deposit (
  deposit : DepositData,
  signer  : SignerAPI
) {
  const { created_at, deposit_addr, dpid, server_pk, server_sig } = deposit
  // Check that the deposit and server pubkeys are a match.
  assert.ok(deposit.deposit_pk === signer.pubkey)
  assert.ok(deposit.server_pk  === server_pk)
  // Check that the deposit address is valid.
  const addr = get_account_ctx(deposit).deposit_addr
  assert.ok(deposit_addr === addr, 'deposit address does not match computed value')
  // Check that the deposit id is valid.
  const req_hash = get_deposit_hash(deposit)
  const int_dpid = get_deposit_id(created_at, req_hash, server_pk)
  assert.ok(int_dpid === dpid, 'deposit id does not match computed value')
  // Check that the deposit signature is valid.
  const is_valid = verify_sig(server_sig, dpid, server_pk)
  assert.ok(is_valid, 'deposit signature is invalid')
}

export function verify_feerate (
  feerate : number,
  policy  : ServerPolicy
) {
  //
  const { FEERATE_MIN, FEERATE_MAX } = policy.deposit
  // Assert that all terms are valid.
  assert.ok(feerate >= FEERATE_MIN, `feerate is below threshold: ${feerate} < ${FEERATE_MIN}`)
  assert.ok(feerate <= FEERATE_MAX, `feerate is above threshold: ${feerate} > ${FEERATE_MAX}`)
}

export function verify_lockable (status : DepositStatus) {
  if (status !== 'pending' && status !== 'open') {
    throw new Error('deposit is not in a lockable state: ' + status)
  }
}

export function verify_utxo (
  request : RegisterRequest
) {
  // Define the utxo object.
  const utxo = request.utxo
  // Unpack our transaction template.
  const ctx = get_account_ctx(request)
  //
  const sdata  = parse_sequence(ctx.sequence)
  //
  const tapkey = parse_script(utxo.scriptkey).asm[1]
  //
  assert.ok(sdata.enabled,                  'sequence field timelock is not enabled.')
  assert.ok(sdata.type === 'stamp',         'sequence field is not configured for timelock.')
  assert.ok(tapkey === ctx.tap_data.tapkey, 'utxo scriptkey does not match tapkey')
}
