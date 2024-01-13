import { Buff, Bytes }  from '@cmdcode/buff'
import CredUtil         from '../lib/cred.ts.ignore'
import { MasterWallet } from './wallet.js'

import {
  hmac256,
  pkdf256
} from '@cmdcode/crypto-tools/hash'

import {
  get_pubkey,
  get_seckey
} from '@cmdcode/crypto-tools/keys'

import {
  KeyPair,
  Signer
} from '../../src/client/class/signer.js'

import {
  ecdh,
  get_ref,
  get_vec,
  import_seed,
  parse_xpub
}  from '../../src/client/lib/util.js'

import {
  KeyConfig,
  KeyCredential,
  PubCredential,
} from '../../src/client/types.js'

import * as assert from '../assert.js'

export class Credential extends KeyPair {

  static import (
    pubcred : string | PubCredential,
    secret  : Bytes
  ) {
    const cred = CredUtil.unwrap(pubcred, secret)
    return new Credential(cred)
  }

  static restore (
    pubcred  : string | PubCredential,
    password : Bytes
  ) {
    if (typeof pubcred === 'string') {
      pubcred = CredUtil.parse(pubcred)
    }
    const secret = pkdf256(password, pubcred.pub)
    return Credential.import(pubcred, secret)
  }

  readonly _cred   : KeyCredential
  readonly _ref    : Buff
  readonly _signer : Signer
  readonly _wallet : MasterWallet

  constructor (cred : KeyCredential) {
    super(cred)

    this._cred = cred
    this._ref  = (cred.ref !== undefined)
      ? Buff.bytes(cred.ref)
      : get_ref(this.kid, this.pubkey, this._seckey)

    this._signer = new Signer(cred)
    this._wallet = new MasterWallet(cred.xpub)
  }

  get is_issued () : boolean {
    const kid = this.hmac('256', this.pubkey)
    return kid.hex !== this.kid
  }

  get ref () {
    return this._ref.hex
  }

  get signer () {
    return this._signer
  }

  get wallet () {
    const idx = this._pubkey.slice(0, 4).num
    return this._wallet.get_account(idx & 0x7FFFFFFF)
  }

  backup (password : string) {
    const enckey = pkdf256(password, this.pubkey)
    return CredUtil.wrap(this._cred, enckey)
  }

  is_issuer (pubkey : Bytes) {
    const ref = get_ref(this.kid, pubkey, this._seckey)
    return ref.hex === this.ref
  }

  share (pubkey : Bytes) {
    return CredUtil.share(this._cred, pubkey)
  }

  /**
   * Returns the current credential as a JSON token.
   */
  toJSON () {
    const wpub   = this._wallet.pubkey
    const enckey = this.ecdh(wpub).slice(1)
    return CredUtil.wrap(this._cred, enckey)
  }

  /**
   * Returns the current credential as a hex string.
   */
  toString () {
    const cred = this.toJSON()
    return CredUtil.encode(cred, 'cred')
  }
}

export class MasterKey extends KeyPair {

  static import (
    cred   : string | PubCredential,
    secret : Bytes
  ) {
    const keycred = CredUtil.unwrap(cred, secret)
    return new MasterKey(keycred)
  }

  static restore (
    cred     : string | PubCredential,
    password : Bytes
  ) {
    if (typeof cred === 'string') {
      cred = CredUtil.parse(cred)
    }
    const secret = pkdf256(password, cred.pub)
    const keycred = CredUtil.unwrap(cred, secret)
    return new MasterKey(keycred)
  }

  static from_seed (
    seed     : string,
    password : string = '',
    options ?: Partial<KeyCredential>
  ) {
    const seckey = import_seed.from_raw(seed, password)
    return new MasterKey({ ...options, seckey })
  }

  static from_words (
    words    : string | string[],
    password : string = '',
    options ?: Partial<KeyCredential>
  ) {
    const seckey = import_seed.from_words(words, password)
    return new MasterKey({ ...options, seckey })
  }

  static generate (options ?: Partial<KeyCredential>) {
    const seckey = Buff.random(32)
    return new MasterKey({ ...options, seckey })
  }

  readonly _cred : KeyCredential

  constructor (config : KeyConfig & { xpub ?: string }) {
    const cred = CredUtil.create(config)
    super(cred)
    this._cred = cred
  }

  get cred () {
    return new Credential(this._cred)
  }

  new_cred () {
    const kid = Buff.random(32)
    return this.get_kid(kid)
  }

  has_cred (cred : string | PubCredential) {
    if (typeof cred === 'string') {
      cred = CredUtil.parse(cred)
    }
    return this.has_kid(cred.kid, cred.pub)
  }

  get_cred (cred : string | PubCredential) {
    if (typeof cred === 'string') {
      cred = CredUtil.parse(cred)
    }
    const seed = hmac256(this._cred.seckey, cred.kid, this._cred.pub)
    const sec  = get_seckey(seed)
    const wpub = parse_xpub(this._cred.xpub).pubkey
    const sha  = ecdh(sec, wpub)
    const img  = Buff.join([ cred.kid, cred.pub, cred.ref ])
    const vec  = get_vec(img, sha)
    assert.ok(vec.hex === cred.vec)
    const kcred = CredUtil.unwrap(cred, sha)
    return new Credential(kcred)
  }

  get_kid (kid : Bytes, xpub ?: string) {
    xpub = xpub ?? this._cred.xpub
    const kcred = CredUtil.derive(kid, this._cred.seckey, xpub)
    return new Credential(kcred)
  }

  has_kid (kid : Bytes, pubkey : Bytes) {
    const seed = hmac256(this._cred.seckey, kid, this._cred.pub)
    const sec  = get_seckey(seed)
    const pub  = get_pubkey(sec, true)
    return pubkey === pub.hex
  }
}
