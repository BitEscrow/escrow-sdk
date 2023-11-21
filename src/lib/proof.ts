import { Buff }       from '@cmdcode/buff'
import { verify_sig } from '@cmdcode/crypto-tools/signer'
import { exception }  from './util.js'

import {
  Literal,
  ProofData,
  SignedEvent
} from '@cmdcode/crypto-tools'

import {
  ProofConfig,
  SignerAPI
} from '../types/index.js'

import * as assert from '../assert.js'

/**
 * Initial values for new proofs.
 */
const PROOF_DEFAULTS = {
  kind  : 20000,
  stamp : 0x00000000,
  tags  : [] as Literal[][]
}

/**
 * Create a new proof string using a provided
 * signing device and content string (plus params).
 */
export function create_proof (
  signer  : SignerAPI,
  content : string,
  params ?: Literal[][] | Record<string, Literal>,
) : string {
  const { kind, stamp, tags } = parse_config(params)
  // Create a reference hash from the content string.
  const ref = Buff.str(content).digest
  // Get pubkey of signing device.
  const pub = signer.pubkey
  // Build the pre-image that we will be hashing.
  const img = [ 0, pub, stamp, kind, tags, content ]
  // Compute the proof id from the image.
  const pid = Buff.json(img).digest
  // Compute a signature for the given id.
  const sig = signer.sign(pid)
  // Return proof as a hex string (with optional query string).
  return Buff.join([ ref, pub, pid, sig ]).hex + encode_params(params)
}

/**
 * Decode and parse a proof string 
 * into a rich data object.
 */
export function parse_proof (proof : string) : ProofData {
  // Split the hex and query strings.
  const [ hexstr, query ] = proof.split('?')
  // Convert the hex string into a data stream.
  const stream = Buff.hex(hexstr).stream
  // Assert the stream size is correct.
  assert.ok(stream.size === 160)
  // Return a data object from the stream.
  return {
    ref    : stream.read(32).hex,
    pub    : stream.read(32).hex,
    pid    : stream.read(32).hex,
    sig    : stream.read(64).hex,
    params : decode_params(query)
  }
}

/**
 * Use regex to check if a proof string is valid.
 */
export function validate_proof (proof : string) : boolean {
  const regex = /^[0-9a-fA-F]{320}(?:\?[A-Za-z0-9_]+=[A-Za-z0-9_]+(?:&[A-Za-z0-9_]+=[A-Za-z0-9_]+)*)?$/
  return regex.test(proof)
}

/**
 * Verify a proof string along with
 * its matching content string.
 */
export function verify_proof (
  proof    : string,
  content  : string,
  options ?: Partial<ProofConfig>
) : boolean {
  const { since, until, throws = false } = options ?? {}
  // Parse the proof data from the hex string.
  const { ref, pub, pid, sig, params } = parse_proof(proof)
  // Parse the configuration from params.
  const { kind, stamp, tags } = parse_config(params)
  // Hash the content string.
  const content_ref = Buff.str(content).digest.hex
  // Check if the hash does not match our link.
  if (content_ref !== ref) {
    return exception('Content hash does not match reference hash!', throws)
  }
  // Assemble the pre-image for the hashing function.
  const img = [ 0, pub, stamp, kind, tags, content ]
  // Stringify and hash the preimage.
  const proof_hash = Buff.json(img).digest
  // Check if the hash does not match our id.
  if (proof_hash.hex !== pid) {
    return exception('Proof hash does not equal proof id!', throws)
  }
  if (since !== undefined && stamp < since) {
    return exception(`Proof stamp below threshold: ${stamp} < ${since}`, throws)
  }
  if (until !== undefined && stamp > until) {
    return exception(`Proof stamp above threshold: ${stamp} > ${until}`, throws)
  }
  // Check if the signature is invalid.
  if (!verify_sig(sig, pid, pub)) {
    return exception('Proof signature is invalid!', throws)
  }
  // If all other tests pass, then the proof is valid.
  return true
}

/**
 * Convert a proof string into a valid nostr note.
 */
export function create_event (
  proof   : string,
  content : string
) : SignedEvent {
  // Parse the proof data from the hex string.
  const { pub, pid, sig, params } = parse_proof(proof)
  // Parse the proof config from the params.
  const { kind, stamp, tags } = parse_config(params)
  // Return the proof formatted as a nostr event.
  return { kind, content, tags, pubkey: pub, id: pid, sig, created_at: stamp }
}

/**
 * Format and encode the paramaters 
 * that are provided with new a proof.
 */
export function encode_params (
  params : Literal[][] | Record<string, Literal> = []
) : string {
  if (!Array.isArray(params)) {
    params = Object.entries(params)
  }
  // Convert all param data into strings.
  const strings = params.map(e => [ String(e[0]), String(e[1]) ])
  // Return the params as a query string.
  return (params.length !== 0)
    ? '?' + new URLSearchParams(strings).toString()
    : ''
}

/**
 * Decode the parameters from a proof string.
 */
export function decode_params (str ?: string) : string[][] {
  // Return the query string as an array of params.
  return (typeof str === 'string')
    ? [ ...new URLSearchParams(str) ]
    : []
}

/**
 * Parse a proof's configuration
 * from the provided parameters.
 */
export function parse_config (
  params : Literal[][] | Record<string, Literal> = []
) : typeof PROOF_DEFAULTS {
  // Unpack the params array.
  if (!Array.isArray(params)) {
    params = Object.entries(params)
  }
  const { kind, stamp, ...rest } = Object.fromEntries(params)
  // Return the config data.
  return {
    tags  : Object.entries(rest).map(([ k, v ]) => [ k, String(v) ]),
    kind  : (kind  !== undefined) ? Number(kind)  : PROOF_DEFAULTS.kind,
    stamp : (stamp !== undefined) ? Number(stamp) : PROOF_DEFAULTS.stamp
  }
}
