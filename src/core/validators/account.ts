import { verify_sig } from '@cmdcode/crypto-tools/signer'

import * as assert       from '@/assert.js'
import { get_object_id } from '@/util.js'

import {
  MAX_LOCKTIME,
  MIN_LOCKTIME
} from '@/const.js'

import { get_account_ctx } from '../lib/account.js'

import {
  AccountData,
  AccountRequest,
  SignerAPI
} from '../types/index.js'

import AcctSchema from '../schema/account.js'
import { parse_addr } from '@scrow/tapscript/address'

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
  request : AccountRequest
) {
  // Unpack request object.
  const { deposit_pk, locktime, network, return_addr } = request
  // Normalize the test network label before verification.
  const net = ([ 'mutiny', 'signet' ].includes(network))
    ? 'testnet'
    : network
  // Assert that the pubkey and address are valid.
  assert.valid_pubkey(deposit_pk)
  assert.valid_address(return_addr, net)
  // Assert that the address is a P2TR address.
  const addr_ctx = parse_addr(return_addr)
  assert.ok(addr_ctx.type === 'p2tr', 'the return address must be a taproot address')
  // Assert that the locktime is valid.
  assert.ok(locktime >= MIN_LOCKTIME, `locktime is below threshold: ${locktime} < ${MIN_LOCKTIME}`)
  assert.ok(locktime <= MAX_LOCKTIME, `locktime is above threshold: ${locktime} > ${MAX_LOCKTIME}`)
}

export function verify_account (
  account   : AccountData,
  server_pk : string,
  signer    : SignerAPI
) {
  const { acct_id, sig, ...rest } = account
  // Create a context object for the account.
  const ctx = get_account_ctx(account)
  // Compute the id for the account data.
  const id  = get_object_id(rest).hex
  //
  const addr = account.deposit_addr
  //
  const pk = account.deposit_pk
  //
  assert.ok(signer.pubkey === pk)
  assert.ok(ctx.deposit_addr === addr)
  assert.ok(id === acct_id)
  assert.ok(verify_sig(sig, id, server_pk))
}
