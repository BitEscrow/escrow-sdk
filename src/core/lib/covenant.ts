/* Global Imports */

import { Buff, Bytes }     from '@cmdcode/buff'
import { hash340, sha512 } from '@cmdcode/crypto-tools/hash'
import { tweak_pubkey }    from '@cmdcode/crypto-tools/keys'

import {
  combine_psigs,
  create_ctx,
  get_nonce_ctx
} from '@cmdcode/musig2'

/* Local Imports */

import { assert, sort_bytes } from '../util/index.js'

import {
  AccountContext,
  ContractData,
  CovenantData,
  DepositData,
  CovenantSession,
  RegisterRequest,
  RegisterTemplate,
  SessionEntry,
  SignerAPI,
  SpendTemplate,
  TxOutput
} from '../types/index.js'

import { create_sighash } from './tx.js'

import {
  get_account_agent,
  get_account_ctx,
  get_deposit_hash
} from '../module/account/util.js'

import {
  get_session_pnonce,
  get_session_seed
} from './session.js'

/**
 * Returns a partially-signed covenant based
 * on the deposit context, contract data, and
 * unspent transaction output.
 */
export function create_covenant (
  contract  : ContractData,
  request   : RegisterRequest,
  funder_sd : SignerAPI
) : CovenantData {
  // Unpack contract object.
  const { cid, outputs } = contract
  // Compute covenant id.
  const cvid     = get_covenant_id(cid, request, outputs)
  // Compute the session pnonce value.
  const pnonce   = get_session_pnonce(cvid, funder_sd).hex
  // Compute the musig context for each spending path.
  const sessions = get_covenant_sessions(cvid, outputs, pnonce, request)
  // Create a partial signature for each context object.
  const psigs    = create_covenant_psigs(sessions, funder_sd)
  // Return the covenant object.
  return { cid, cvid, pnonce, psigs }
}

export function settle_covenant (
  contract  : ContractData,
  deposit   : DepositData,
  output    : string,
  psig      : string,
  server_sd : SignerAPI
) : string {
  //
  assert.exists(deposit.covenant)
  //
  const { cid, outputs }   = contract
  //
  const { covenant, utxo } = deposit
  // Get signing agent for account.
  const agent   = get_account_agent(deposit, server_sd)
  // Get account context object.
  const ctx     = get_account_ctx(deposit)
  // Compute covenant id
  const cvid    = get_covenant_id(cid, deposit, outputs)
  //
  const session = get_covenant_session(ctx, cvid, output, covenant.pnonce, utxo)
  //
  const ag_psig = settle_covenant_psig(session, agent)
  //
  const musig   = combine_psigs(session.musig, [ psig, ag_psig ])
  //
  return musig.append(0x81).hex
}

/**
 * Get the covenant id for a deposit account and contract.
 */
export function get_covenant_id (
  cid     : string,
  deposit : RegisterTemplate | DepositData,
  outputs : SpendTemplate[]
) {
  const dhash = get_deposit_hash(deposit)
  const tdata = outputs.map(e => Buff.hex(e[1]))
  const pimg  = Buff.join([ cid, dhash, ...tdata ])
  return sha512(pimg).hex
}

/**
 * Compute a list of musig context objects
 * for each spending path in the contract.
 */
export function get_covenant_sessions (
  cvid    : string,
  outputs : SpendTemplate[],
  pnonce  : string,
  request : RegisterTemplate
) : SessionEntry[] {
  // Get account context object.
  const ctx = get_account_ctx(request)
  // Return a list of musig contexts for each spending path.
  return outputs.map(([ label, output ]) => {
    // Create a musig context object with the txinput.
    const session = get_covenant_session(ctx, cvid, output, pnonce, request.utxo)
    // Return the musig context as a labeled tuple.
    return [ label, session ]
  })
}

/**
 * Compute and return a musig context object
 * for a given transaction input and output.
 */
export function get_covenant_session (
  acct   : AccountContext,
  cvid   : string,
  output : string,
  pnonce : string,
  utxo   : TxOutput
) : CovenantSession {
  // Unpack the context object.
  const { key_data, tap_data, session } = acct
  // Define array of pnonces for session.
  const pnonces   = [ pnonce, session.pn ]
  // Unpack the group pubkey for the deposit.
  const group_pub = key_data.group_pubkey
  // Compute the transaction signature hash.
  const sighash   = create_sighash(output, utxo)
  // Compute the nonce tweak for the given signing session.
  const nonce_twk = get_covenant_tweak(cvid, pnonces, sighash)
  // Get a list of tweaked pubnonces, using the session tweak.
  const pubnonces = tweak_pnonces(pnonces, nonce_twk)
  // Compute the nonce portion of the musig protocol.
  const nonce_ctx = get_nonce_ctx(pubnonces, group_pub, sighash)
  // Set additional options for the musig context object.
  const musig_opt = { key_tweaks: [ tap_data.taptweak ] }
  // Combine the key and nonce data into the final musig context.
  const musig_ctx = create_ctx(key_data, nonce_ctx, musig_opt)
  // Return the musig context object along with session id and tweak.
  return {
    acct,
    cvid,
    musig : musig_ctx,
    tweak : nonce_twk,
    utxo
  }
}

/**
 * Returns a list of partial signatures,
 * from a list of musig context objects.
 */
export function create_covenant_psigs (
  sessions : SessionEntry[],
  signer   : SignerAPI
) : [ string, string ][] {
  return sessions.map(([ label, ctx ]) => {
    const psig = create_covenant_psig(ctx, signer)
    return [ label, psig ]
  })
}

/**
 * Returns a partial signature, using the
 * provided signer and musig context object.
 */
export function create_covenant_psig (
  session : CovenantSession,
  signer  : SignerAPI
) : string {
  const { cvid, musig, tweak } = session
  const opt = { nonce_tweak: tweak }
  return signer.musign(musig, cvid, opt).hex
}

export function settle_covenant_psig (
  session : CovenantSession,
  signer  : SignerAPI
) : string {
  const { acct, musig, tweak } = session
  const { id, ts } = acct.session
  const seed = get_session_seed(id, signer, ts)
  const opt  = { nonce_tweak: tweak }
  return signer.musign(musig, seed, opt).hex
}

export function get_covenant_psig (
  label    : string,
  covenant : CovenantData
) {
  const entry = covenant.psigs.find(e => e[0] === label)

  if (entry === undefined) {
    throw new Error('covenant psig not found for label: ' + label)
  }

  return entry[1]
}

/**
 * Computes and returns the tweak value for
 * a list of pnonces, for the given session
 * id and transaction signature hash.
 */
export function get_covenant_tweak (
  hash_id : Bytes,
  pnonces : Bytes[],
  sighash : Bytes
) : Buff {
  // Sort and join the list of nonces.
  const pns = Buff.join(sort_bytes(pnonces))
  // The final tweak value uses the following format.
  return hash340('musig2/session', hash_id, pns, sighash)
}

/**
 * Tweaks a list of pnonces using the provided tweak data.
 */
export function tweak_pnonces (
  keys  : Bytes[],
  tweak : Bytes
) : Buff[] {
  return keys.map(e => tweak_pnonce(e, tweak))
}

/**
 * Tweak a pnonce value using the provided tweak data.
 */
export function tweak_pnonce (
  key   : Bytes,
  tweak : Bytes
) {
  const pnonces = Buff
    .parse(key, 32, 64)
    .map(k => tweak_pubkey(k, [ tweak ], true))
  return Buff.join(pnonces)
}
