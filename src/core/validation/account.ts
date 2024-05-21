/* Global Imports */

import { verify_sig } from '@cmdcode/crypto-tools/signer'
import { parse_addr } from '@scrow/tapscript/address'

/* Module Imports */

import { assert } from '../util/index.js'

import {
  get_session_pnonce,
  get_session_seed,
  parse_session_token
} from '../lib/session.js'

import {
  get_account_agent,
  get_account_ctx,
  get_account_hash,
  get_account_id
} from '../module/account/util.js'

import {
  AccountData,
  AccountRequest,
  CommitRequest,
  ContractData,
  RegisterRequest,
  AccountPolicy,
  SignerAPI
} from '../types/index.js'

import { verify_feerate, verify_utxo }              from './deposit.js'
import { verify_covenant_data, verify_return_psig } from './covenant.js'

import AcctSchema from '../schema/account.js'

export function validate_account_req (
  request : unknown
) : asserts request is AccountRequest {
  void AcctSchema.account_req.parse(request)
}

export function validate_register_req (
  request : unknown
) : asserts request is RegisterRequest {
  void AcctSchema.register_req.parse(request)
}

export function validate_commit_req (
  request : unknown
) : asserts request is CommitRequest {
  void AcctSchema.commit_req.parse(request)
}

export function validate_account_data (
  account : unknown
) : asserts account is AccountData {
  void AcctSchema.data.parse(account)
}

export function validate_session_token (
  token : string
) : asserts token is string {
  AcctSchema.token.parse(token)
}

export function verify_account_req (
  policy  : AccountPolicy,
  request : AccountRequest
) {
  // Unpack policy object.
  const { LOCKTIME_MIN, LOCKTIME_MAX } = policy
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

export function verify_register_req (
  policy  : AccountPolicy,
  request : RegisterRequest,
  signer  : SignerAPI
) {
  const psig = request.return_psig
  verify_feerate(request.return_rate, policy)
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
  policy    : AccountPolicy,
  request   : CommitRequest,
  agent : SignerAPI
) {
  const covenant = request.covenant
  verify_register_req(policy, request, agent)
  verify_covenant_data(contract, covenant, request, agent)
}

export function verify_account_data (
  account : AccountData,
  signer  : SignerAPI
) {
  const { account_id, created_at, created_sig, deposit_addr, agent_pk, agent_tkn } = account
  // Create a context object for the account.
  const ctx = get_account_ctx(account)
  //
  const hash = get_account_hash(account)
  // Compute the id for the account data.
  const id  = get_account_id(deposit_addr, hash, agent_pk, created_at, agent_tkn)
  // Define the deposit address
  const addr = account.deposit_addr
  // Define the deposit pubkey.
  const pk = account.deposit_pk
  // Assert the following is valid.
  assert.ok(signer.pubkey === pk,      'deposit pubkey does not match signing device')
  assert.ok(ctx.deposit_addr === addr, 'deposit address does not match signing device')
  assert.ok(id === account_id,         'account id does not match computed id')
  assert.ok(verify_sig(created_sig, id, agent_pk), 'server signature is invalid')
}

export function verify_session_token (
  request   : RegisterRequest,
  agent_dev : SignerAPI
) {
  const agent = get_account_agent(request, agent_dev)
  const sess  = parse_session_token(request.agent_tkn)
  const seed  = get_session_seed(sess.id, agent, sess.ts)
  const agpn  = get_session_pnonce(seed, agent).hex

  assert.ok(sess.pk === agent.pubkey, 'session pubkey does not match request')
  assert.ok(sess.pn === agpn,         'session pubnonce does not match request')
}

export default {
  validate : {
    request  : validate_account_req,
    register : validate_register_req,
    commit   : validate_commit_req,
    data     : validate_account_data,
    token    : validate_session_token
  },
  verify : {
    request  : verify_account_req,
    register : verify_register_req,
    commit   : verify_commit_req,
    data     : verify_account_data,
    token    : verify_session_token
  }
}
