import { Buff, Bytes }     from '@cmdcode/buff'
import { hash340, sha512 } from '@cmdcode/crypto-tools/hash'
import { tweak_pubkey }    from '@cmdcode/crypto-tools/keys'
import { TxPrevout }       from '@scrow/tapscript'
import { get_deposit_ctx } from './deposit.js'

import {
  create_ctx,
  get_nonce_ctx,
  verify_psig,
} from '@cmdcode/musig2'

import {
  create_sighash,
  create_tx_tmpl,
  create_txinput,
  parse_txinput
}  from './tx.js'

import {
  get_entry,
  sort_bytes
} from './util.js'

import {
  AgentSession,
  ContractData,
  CovenantData,
  DepositContext,
  DepositData,
  MutexContext,
  MutexEntry,
  DepositReturn,
  SignerAPI,
  TxOutput
} from '../types/index.js'

/**
 * Returns an agent session based on the
 * provided signer and record id.
 */
export function create_session (
  agent     : SignerAPI,
  record_id : string
) : AgentSession {
  const pnonce = get_session_pnonce(agent.id, record_id, agent)
  return {
    agent_id : agent.id,
    agent_pk : agent.pubkey,
    agent_pn : pnonce.hex
  }
}

/**
 * Returns a partially-signed covenant based
 * on the deposit context, contract data, and
 * unspent transaction output.
 */
export function create_spend_psigs (
  context  : DepositContext,
  contract : ContractData,
  signer   : SignerAPI,
  txout    : TxOutput
) : CovenantData {
  // Unpack contract object.
  const { agent_id, cid, agent_pn } = contract
  // Compute the session pnonce value
  const pnonce  = get_session_pnonce(agent_id, cid, signer).hex
  // Combine pnonces into a list.
  const pnonces = [ pnonce, agent_pn ]
  // Compute the musig context for each spending path.
  const mupaths = get_path_mutexes(context, contract, pnonces, txout)
  // Create a partial signature for each context object.
  const psigs   = create_psigs(mupaths, signer)
  // Return the covenant object.
  return { cid, pnonce, psigs }
}

/**
 * Returns a partially-signed transaction
 * signature, to be used for collaboratively
 * returning a deposit back to the sender.
 */
export function create_return_psig (
  address : string,
  deposit : DepositData,
  signer  : SignerAPI,
  txfee   : number
) : DepositReturn {
  // Unpack the deposit object.
  const { agent_id, dpid, agent_pn, value } = deposit
  // Compute the session pnonce value.
  const pnonce  = get_session_pnonce(agent_id, dpid, signer).hex
  // Combine pnonces into a list.
  const pnonces = [ pnonce, agent_pn ]
  // Create a return transaction using the provided params.
  const txhex   = create_tx_tmpl(address, value - txfee)
  // Compute a musig context object for the transaction.
  const mutex   = get_return_mutex(deposit, pnonces, txhex)
  // Create a partial signature using the musig context.
  const psig    = create_mutex_psig(mutex, signer)
  // Return the final payload.
  return { dpid, pnonce, psig, txhex }
}

/**
 * Compute a list of musig context objects
 * for each spending path in the contract.
 */
export function get_path_mutexes (
  context  : DepositContext,
  contract : ContractData,
  pnonces  : Bytes[],
  txout    : TxOutput
) : MutexEntry[] {
  // Unpack the contract object.
  const { agent_id, cid, outputs } = contract
  // Compute a session id for the agent and contract.
  const sid = get_session_id(agent_id, cid)
  // Return a list of musig contexts for each spending path.
  return outputs.map(([ label, vout ]) => {
    // Create a txinput from the utxo data.
    const txinput = create_txinput(txout)
    // Create a musig context object with the txinput.
    const mut_ctx = get_mutex_ctx(context, vout, pnonces, sid, txinput)
    // Return the musig context as a labeled tuple.
    return [ label, mut_ctx ]
  })
}

/**
 * Compute a musig context object for
 * collaboratively closing a deposit.
 */
export function get_return_mutex (
  deposit : DepositData,
  pnonces : Bytes[],
  txhex   : string
) : MutexContext {
  // Unpack the deposit object.
  const { agent_id, agent_pk, dpid, member_pk, sequence } = deposit
  // Get a context object for the deposit.
  const dep_ctx = get_deposit_ctx(agent_pk, member_pk, sequence)
  // Compute the session id for the agent and deposit.
  const sid     = get_session_id(agent_id, dpid)
  // Parse the txinput from the deposit data.
  const txinput = parse_txinput(deposit)
  // Create and return a musig context object with the txinput.
  return get_mutex_ctx(dep_ctx, txhex, pnonces, sid, txinput)
}

/**
 * Compute and return a musig context object
 * for a given transaction input and output.
 */
export function get_mutex_ctx (
  context : DepositContext,
  output  : string,
  pnonces : Bytes[],
  sid     : Bytes,
  txinput : TxPrevout
) : MutexContext {
  // Unpack the context object.
  const { key_data, tap_data } = context
  // Unpack the group pubkey for the deposit.
  const group_pub = key_data.group_pubkey
  // Compute the transaction signature hash.
  const sighash   = create_sighash(txinput, output)
  // Compute the nonce tweak for the given signing session.
  const nonce_twk = get_session_tweak(sid, pnonces, sighash)
  // Get a list of tweaked pubnonces, using the session tweak.
  const pubnonces = tweak_pnonces(pnonces, nonce_twk)
  // Compute the nonce portion of the musig protocol.
  const nonce_ctx = get_nonce_ctx(pubnonces, group_pub, sighash)
  // Set additional options for the musig context object.
  const musig_opt = { key_tweaks : [ tap_data.taptweak ] }
  // Combine the key and nonce data into the final musig context.
  const musig_ctx = create_ctx(key_data, nonce_ctx, musig_opt)
  // Return the musig context object along with session id and tweak.
  return {
    sid,
    mutex : musig_ctx,
    tweak : nonce_twk
  }
}

/**
 * Compute a combined session id hash
 * using the agent id and record id.
 */
export function get_session_id (
  agent_id  : Bytes, 
  record_id : Bytes
) {
  return sha512(agent_id, record_id)
}

/**
 * Returns a deterministic session 
 * pnonce from the provided signer,
 * for a given agent id and record id. 
 */
export function get_session_pnonce (
  agent_id  : Bytes,
  record_id : Bytes,
  signer    : SignerAPI
) {
  // Compute the session id for the given agent and record.
  const sid = get_session_id(agent_id, record_id)
  // Compute the first portion of the nonce using the signer.
  const pn1 = signer.gen_nonce(sid.subarray(0, 32))
  // Compute the second portion of the nonce using the signer.
  const pn2 = signer.gen_nonce(sid.subarray(32, 64))
  // Combine and return both nonces.
  return Buff.join([ pn1, pn2 ])
}

/**
 * Computes and returns the tweak value for
 * a list of pnonces, for the given session 
 * id and transaction signature hash.
 */
export function get_session_tweak (
  sid     : Bytes,
  pnonces : Bytes[],
  sighash : Bytes
) : Buff {
  // Sort and join the list of nonces.
  const pns = Buff.join(sort_bytes(pnonces))
  // The final tweak value uses the following format.
  return hash340 ('contract/session', sid, pns, sighash)
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

/**
 * Returns a list of partial signatures,
 * from a list of musig context objects.
 */
export function create_psigs (
  mutexes : MutexEntry[],
  signer  : SignerAPI
) : [ string, string ][] {
  return mutexes.map(([ label, ctx ]) => {
    return [ label, create_mutex_psig(ctx, signer) ]
  })
}

/**
 * Returns a partial signature, using the
 * provided signer and musig context object.
 */
export function create_mutex_psig (
  context : MutexContext,
  signer  : SignerAPI
) : string {
  const { sid, mutex, tweak } = context
  const opt = { nonce_tweak : tweak }
  return signer.musign(mutex, sid, opt).hex
}

/**
 * Verify a list of partial signatures,
 * using the provided musig context object.
 */
export function verify_mutex_psigs (
  mutexes : MutexEntry[],
  psigs   : [ string, string ][]
) {
  for (const [ label, ctx ] of mutexes) {
    const psig = get_entry(label, psigs)
    if (!verify_mutex_psig(ctx, psig)) {
      throw new Error('psig failed validation for path: ' + label)
    }
  }
}

/**
 * Verify a partial signatures, using 
 * the provided musig context object.
 */
export function verify_mutex_psig (
  ctx  : MutexContext,
  psig : Bytes
) {
  return verify_psig(ctx.mutex, psig)
}
