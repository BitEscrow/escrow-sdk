import { Buff, Bytes }         from '@cmdcode/buff'
import { assert, sort_record } from '@/util/index.js'

import {
  SessionToken,
  SignerAPI
} from '../types/index.js'

/**
 * Generates a cryptographic token for use
 * in concurrent musig2 signature sessions.
 */
export function gen_session_token (
  signer : SignerAPI,
  stamp  : number,
  aux    : Bytes = Buff.random(32)
) : SessionToken {
  // Buffer auxiliary data.
  const id    = Buff.bytes(aux).hex
  // Compute the nonce seed value.
  const seed  = get_session_seed(id, signer, stamp)
  // Buffer pubkey data.
  const pk    = signer.pubkey
  // Get the pnonce value from the signer.
  const pn    = get_session_pnonce(seed, signer).hex
  // Create a combined token string.
  const tkn   = Buff.join([ Buff.num(stamp, 4), pk, id, pn ]).hex
  // Return the root id and pubnonce.
  return { id, pk, pn, tkn, ts: stamp }
}

/**
 * Parse a token string into
 * a session token object.
 */
export function parse_session_token (token : string) : SessionToken {
  // Convert covenant root into byte stream.
  const stream = Buff.hex(token).stream
  // Check that stream size is valid.
  assert.ok(stream.size === 132, `Invalid length for session root: ${stream.size} !== 132`)
  // Return the stream parsed as an object.
  return sort_record({
    tkn : token,
    ts  : stream.read(4).num,
    pk  : stream.read(32).hex,
    id  : stream.read(32).hex,
    pn  : stream.read(64).hex
  })
}

/**
 * Compute the seed value used
 * for generating a root nonce.
 */
export function get_session_seed (
  root_id : Bytes,
  signer  : SignerAPI,
  stamp   : number
) {
  const cat = Buff.num(stamp, 4)
  return signer.hmac('512', signer.pubkey, root_id, cat)
}

/**
 * Returns a deterministic pnonce from the
 * provided signer for a given seed value.
 */
export function get_session_pnonce (
  seed   : Bytes,
  signer : SignerAPI
) {
  // Buffer the seed.
  const buff = Buff.bytes(seed)
  // Assert the size is correct.
  assert.size(seed, 64)
  // Compute the first portion of the nonce using the signer.
  const pn1 = signer.gen_nonce(buff.subarray(0, 32))
  // Compute the second portion of the nonce using the signer.
  const pn2 = signer.gen_nonce(buff.subarray(32, 64))
  // Combine and return both nonces.
  return Buff.join([ pn1, pn2 ])
}
