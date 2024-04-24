/* Global Imports */

import { verify_sig } from '@cmdcode/crypto-tools/signer'
import { parse_addr } from '@scrow/tapscript/address'

/* Module Imports */

import { assert } from '../util/index.js'

import {
  get_account_ctx,
  get_account_hash,
  get_account_id
} from '../lib/account.js'

import {
  AccountData,
  AccountRequest,
  ServerPolicy,
  SignerAPI
} from '../types/index.js'

import AcctSchema from '../schema/account.js'

export function validate_account_req (
  request : unknown
) : asserts request is AccountRequest {
  void AcctSchema.request.parse(request)
}

export function validate_account (
  account : unknown
) : asserts account is AccountData {
  void AcctSchema.data.parse(account)
}

export function verify_account_req (
  policy  : ServerPolicy,
  request : AccountRequest
) {
  // Unpack policy object.
  const { LOCKTIME_MIN, LOCKTIME_MAX } = policy.account
  // Unpack request object.
  const { deposit_pk, locktime, network, return_addr } = request
  // Normalize the test network label before verification.
  const net = ([ 'mutiny', 'signet' ].includes(network))
    ? 'testnet'
    : network
  // Assert that the pubkey and address are valid.
  assert.is_valid_pubkey(deposit_pk)
  assert.is_valid_address(return_addr, net)
  // Assert that the address is a P2TR address.
  const addr_ctx = parse_addr(return_addr)
  assert.ok(addr_ctx.type === 'p2tr', 'the return address must be a taproot address')
  // Assert that the locktime is valid.
  assert.ok(locktime >= LOCKTIME_MIN, `locktime is below threshold: ${locktime} < ${LOCKTIME_MIN}`)
  assert.ok(locktime <= LOCKTIME_MAX, `locktime is above threshold: ${locktime} > ${LOCKTIME_MAX}`)
}

export function verify_account (
  account : AccountData,
  signer  : SignerAPI
) {
  const { acct_id, created_at, deposit_addr, server_pk, server_sig, server_tkn } = account
  // Create a context object for the account.
  const ctx = get_account_ctx(account)
  //
  const hash = get_account_hash(account)
  // Compute the id for the account data.
  const id  = get_account_id(deposit_addr, hash, server_pk, created_at, server_tkn)
  //
  const addr = account.deposit_addr
  //
  const pk = account.deposit_pk
  //
  assert.ok(signer.pubkey === pk)
  assert.ok(ctx.deposit_addr === addr)
  assert.ok(id === acct_id)
  assert.ok(verify_sig(server_sig, id, server_pk))
}
