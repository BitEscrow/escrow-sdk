import { Buff }       from '@cmdcode/buff'
import { verify_sig } from '@cmdcode/crypto-tools/signer'

import {
  Literal,
  ProofData,
  SignedEvent
} from '@cmdcode/crypto-tools'

import {
  exception,
  stringify
} from './util.js'

import {
  ProofConfig,
  SignerAPI
} from '../types/index.js'

import * as assert from '../assert.js'

const PROOF_DEFAULTS = {
  kind  : 20000,
  stamp : 0x00000000,
  tags  : [] as Literal[][]
}

export function create_proof <T> (
  signer   : SignerAPI,
  data     : T,
  params  ?: Literal[][] | Record<string, Literal>,
) : string {
  const { kind, stamp, tags } = parse_config(params)
  // Stringify data.
  const content = stringify(data)
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

export function parse_proof (proof : string) : ProofData {
  const [ hexstr, query ] = proof.split('?')
  const stream = Buff.hex(hexstr).stream
  assert.ok(stream.size === 160)
  return {
    ref    : stream.read(32).hex,
    pub    : stream.read(32).hex,
    pid    : stream.read(32).hex,
    sig    : stream.read(64).hex,
    params : decode_params(query)
  }
}

export function parse_proofs (
  proofs : string[]
) : ProofData[] {
  return proofs.map(e => parse_proof(e))
}

export function validate_proof (proof : string) : boolean {
  // Use regex to check that proof hex is valid (160 * 2 hex bytes)
  // also use regex to check that param string is valid (url params)
  const regex = /^[0-9a-fA-F]{320}(?:\?[A-Za-z0-9_]+=[A-Za-z0-9_]+(?:&[A-Za-z0-9_]+=[A-Za-z0-9_]+)*)?$/
  return regex.test(proof)
}

export function verify_proof <T> (
  proof    : string,
  data     : T,
  options ?: Partial<ProofConfig>
) : boolean {
  const { since, until, throws = false } = options ?? {}
  // Parse the proof data from the hex string.
  const { ref, pub, pid, sig, params } = parse_proof(proof)
  // Parse the configuration from params.
  const { kind, stamp, tags } = parse_config(params)
  // Stringify the data object into a content string.
  const content = stringify(data)
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

export function create_event <T> (
  proof : string,
  data  : T
) : SignedEvent {
  // Serialize the data object into a string.
  const content = stringify(data)
  // Parse the proof data from the hex string.
  const { pub, pid, sig, params } = parse_proof(proof)
  // Parse the proof config from the params.
  const { kind, stamp, tags } = parse_config(params)
  // Return the proof formatted as a nostr event.
  return { kind, content, tags, pubkey: pub, id: pid, sig, created_at: stamp }
}

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

export function decode_params (str ?: string) : string[][] {
  // Return the query string as an array of params.
  return (typeof str === 'string')
    ? [ ...new URLSearchParams(str) ]
    : []
}

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
