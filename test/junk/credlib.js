import { Buff, Bytes } from '@cmdcode/buff'
import { HDKey }       from '@scure/bip32'
import { KeyPair }     from '../../src/client/class/signer.js'
import { hmac256 }     from '@cmdcode/crypto-tools/hash'

import {
  get_pubkey,
  get_seckey
} from '@cmdcode/crypto-tools/keys'

import {
  create_proof,
  proof_to_note
} from './proof.js'

import {
  decrypt,
  ecdh,
  encrypt,
  get_ref,
  get_vec
} from '../../src/client/lib/util.js'

import {
  KeyConfig,
  KeyCredential,
  PubCredential
} from '../../src/client/types.js'

export function create_credential (
  config : KeyConfig & { xpub ?: string }
) : KeyCredential {
  const { kid, pubkey: pub } = new KeyPair(config)
  const seckey = Buff.bytes(config.seckey)
  const ref    = get_ref(kid, pub, seckey)
  const xpub   = (config.xpub !== undefined)
    ? config.xpub
    : HDKey.fromMasterSeed(seckey).publicExtendedKey
  return { kid, pub, ref, seckey, xpub }
}

export function derive_credential (
  kid    : Bytes,
  secret : Bytes,
  xpub   : string
) {
  const iss_sec = Buff.bytes(secret)
  const iss_pub = get_pubkey(iss_sec, true)
  const seed    = hmac256(iss_sec, kid, iss_pub)
  const seckey  = get_seckey(seed)
  const pub     = get_pubkey(seckey, true)
  const ref     = get_ref(kid, iss_pub, seckey)
  return { kid, pub, ref, seckey, xpub }
}

export function wrap_credential (
  cred   : KeyCredential,
  secret : Bytes
) : PubCredential {
  let { kid, pub, ref, seckey, xpub } = cred
  const dat = Buff.join([ seckey, Buff.b58chk(xpub) ])
  const img = Buff.join([ kid, pub, ref ])
  const vec = get_vec(img, secret)
  const enc = encrypt(dat, secret, vec)
  const pay = Buff.raw(enc).hex
  kid = Buff.bytes(kid).hex
  pub = Buff.bytes(pub).hex
  ref = Buff.bytes(ref).hex
  return { kid, pay, pub, ref, vec : vec.hex }
}

export function encode_credential (
  cred   : PubCredential,
  prefix : string = 'cred'
) {
  const { kid, pay, pub, ref, vec } = cred
  return Buff.join([ kid, pub, ref, vec, pay ]).to_bech32(prefix)
}

export function parse_credential (
  cred   : string,
  prefix : string = 'cred'
) : PubCredential {
  const stream = Buff.bech32(cred, false, prefix).stream
  const kid = stream.read(32).hex
  const pub = stream.read(32).hex
  const ref = stream.read(16).hex
  const vec = stream.read(16).hex
  const pay = stream.read(stream.size).hex
  return { kid, pay, pub, ref, vec }
}

export function share_credential (
  cred   : KeyCredential,
  pubkey : Bytes
) {
  const { kid, pub, ref, seckey, xpub } = cred
  const dat = Buff.json({ seckey, xpub })
  const sha = ecdh(seckey, pubkey)
  const dig = Buff.join([ kid, pub, ref ])
  const vec = get_vec(dig, sha)
  const enc = encrypt(dat, sha, vec)
  const content = `${enc.b64url}?iv=${vec.b64url}`
  const params  = [[ 'p', Buff.bytes(pubkey).hex ]]
  const proof   = create_proof({ content, kind : 4, params, seckey })
  return proof_to_note(content, proof)
}

export function unwrap_credential (
  cred   : string | PubCredential,
  secret : Bytes
) : KeyCredential {
  if (typeof cred === 'string') {
    cred = parse_credential(cred)
  }
  const { kid, pay, pub, ref } = cred
  const img = Buff.join([ kid, pub, ref ])
  const vec = get_vec(img, secret)
  const dec = decrypt(pay, secret, vec)
  const seckey = dec.slice(0, 32)
  const xpub   = dec.slice(32).b58chk
  return { kid, pub, ref, seckey, xpub }
}

export default {
  create : create_credential,
  derive : derive_credential,
  encode : encode_credential,
  parse  : parse_credential,
  share  : share_credential,
  unwrap : unwrap_credential,
  wrap   : wrap_credential
}
