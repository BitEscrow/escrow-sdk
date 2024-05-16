/* Global Imports */

import { parse_script }   from '@scrow/tapscript/script'
import { parse_sequence } from '@scrow/tapscript/tx'

/* Module Imports */

import { assert, now } from '../util/index.js'

import {
  get_account_ctx,
  get_deposit_hash
} from '../module/account/util.js'

import {
  get_deposit_id,
  verify_deposit_sig
} from '../module/deposit/util.js'

import {
  CloseRequest,
  CommitRequest,
  ContractData,
  DepositData,
  DepositStatus,
  LockRequest,
  OracleTxRecvStatus,
  RegisterRequest,
  ServerPolicy,
  SignerAPI
} from '../types/index.js'

import DepositSchema from '../schema/deposit.js'

/* Local Imports */

import {
  verify_covenant_data,
  verify_return_psig
} from './covenant.js'

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

export function validate_deposit_data (
  deposit : Record<string, any>
) : asserts deposit is DepositData {
  DepositSchema.data.parse(deposit)
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
  verify_covenant_data(contract, covenant, deposit, server_sd)
}

export function verify_close_req (
  deposit : DepositData,
  policy  : ServerPolicy,
  request : CloseRequest
) {
  const psig = request.return_psig
  assert.ok(request.dpid === deposit.dpid)
  assert.ok(deposit.covenant === null)
  verify_feerate(request.return_rate, policy)
  // Verify the return psig.
  verify_return_psig(deposit, psig)
}

export function verify_deposit_data (
  deposit : DepositData,
  signer  : SignerAPI
) {
  const { created_at, deposit_addr, dpid } = deposit
  // Check that the deposit and server pubkeys are a match.
  assert.ok(deposit.deposit_pk === signer.pubkey)
  // Check that the deposit address is valid.
  const addr = get_account_ctx(deposit).deposit_addr
  assert.ok(deposit_addr === addr, 'deposit address does not match computed value')
  // Check that the deposit id is valid.
  const req_hash = get_deposit_hash(deposit)
  const int_dpid = get_deposit_id(created_at, req_hash)
  assert.ok(int_dpid === dpid, 'deposit id does not match computed value')
}

export function verify_deposit_sigs (
  deposit : DepositData,
  pubkey  : string
) {
  const labels = deposit.sigs.map(e => e[0])

  assert.ok(labels.includes('registered'),                      'deposit signature missing: registered')
  assert.ok(!deposit.confirmed || labels.includes('confirmed'), 'deposit signature missing: confirmed')
  assert.ok(!deposit.locked    || labels.includes('locked'),    'deposit signature missing: locked')
  assert.ok(!deposit.closed    || labels.includes('closed'),    'deposit signature missing: closed')
  assert.ok(!deposit.spent     || labels.includes('spent'),     'deposit signature missing: spent')
  assert.ok(!deposit.settled   || labels.includes('settled'),   'deposit signature missing: settled')

  deposit.sigs.forEach(sig => {
    verify_deposit_sig(deposit, pubkey, sig)
  })
}

export function verify_feerate (
  feerate : number,
  policy  : ServerPolicy
) {
  //
  const { FEERATE_MIN, FEERATE_MAX } = policy.account
  // Assert that all terms are valid.
  assert.ok(feerate >= FEERATE_MIN, `feerate is below threshold: ${feerate} < ${FEERATE_MIN}`)
  assert.ok(feerate <= FEERATE_MAX, `feerate is above threshold: ${feerate} > ${FEERATE_MAX}`)
}

export function verify_lockable (status : DepositStatus) {
  if (status !== 'registered' && status !== 'confirmed') {
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

export function verify_utxo_lock (
  locktime : number,
  policy   : ServerPolicy,
  status   : OracleTxRecvStatus,
  current = now()
) {
  const limit = current - policy.account.GRACE_PERIOD
  if (status.confirmed && status.block_time + locktime <= limit) {
    throw new Error('Deposit lock is expiring within the grace period.')
  }
}

export default {
  validate : {
    lock_req  : validate_lock_req,
    close_req : validate_close_req,
    data      : validate_deposit_data
  },
  verify : {
    lock_req   : verify_lock_req,
    close_req  : verify_close_req,
    data       : verify_deposit_data,
    sigs       : verify_deposit_sigs,
    confirm    : null,
    lock       : null,
    spend      : null,
    settlement : null
  }
}
