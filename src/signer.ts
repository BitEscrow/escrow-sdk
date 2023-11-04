import { Buff, Bytes }     from '@cmdcode/buff'
import { hmac512, sha256 } from '@cmdcode/crypto-tools/hash'
import { derive_key }      from '@cmdcode/crypto-tools/hd'
import { get_shared_key }  from '@cmdcode/crypto-tools/ecdh'

import {
  MusigContext,
  musign
} from '@cmdcode/musig2'

import {
  gen_seckey,
  get_seckey,
  get_pubkey
} from '@cmdcode/crypto-tools/keys'

import {
  gen_nonce,
  sign_msg
} from '@cmdcode/crypto-tools/signer'

import {
  SignerConfig,
  SignerOptions
} from './types/index.js'

import * as assert from './assert.js'

const MSG_MIN_VALUE = 0xFFn ** 24n

export class Signer {

  static generate (
    config ?: SignerConfig
  ) : Signer {
    const sec = gen_seckey()
    return new Signer(sec, config)
  }

  static seed (
    seed    : string, 
    config ?: SignerConfig
  ) {
    const sec = Buff.str(seed).digest
    return new Signer(sec, config)
  }

  readonly _pubkey : Buff
  readonly _seckey : Buff
  readonly _chain ?: Buff
  readonly _config : SignerConfig

  constructor (
    secret : Bytes,
    config : SignerConfig = {}
  ) {
    const { hd_path, hd_code } = config
    if (typeof hd_path === 'string') {
      // Derive new key and code from path.
      const { seckey, code } = derive_key(
        hd_path, secret, hd_code, true
      )
      // Assert that the secret key exists.
      assert.exists(seckey)
      // Apply new key as secret.
      secret = seckey
      // Apply new chain code to config.
      this._chain = code
    }

    this._seckey = get_seckey(secret)
    this._pubkey = get_pubkey(this._seckey, true)
    this._config = config
  }

  get id () : string {
    return sha256(this.pubkey).hex
  }

  get pubkey () : string {
    return this._pubkey.hex
  }

  _gen_nonce (opt ?: SignerOptions) {
    const config = { aux: null, ...this._config, ...opt }
    return (msg : Bytes) : Buff => {
      return gen_nonce(msg, this._seckey, config)
    }
  }

  _musign (opt ?: SignerOptions) {
    const config = { ...this._config, ...opt }
    return (
      context : MusigContext,
      auxdata : Bytes
    ) : Buff => {
      const sns = Buff
        .parse(auxdata, 32, 64)
        .map(e => this._gen_nonce(config)(e))
      return musign(context, this._seckey, Buff.join(sns))
    }
  }

  _sign (opt ?: SignerOptions) {
    const config = { ...this._config, ...opt }
    return (msg : Bytes) : string => {
      assert.size(msg, 32)
      assert.min_value(msg, MSG_MIN_VALUE)
      return sign_msg(msg, this._seckey, config).hex
    }
  }

  derive (path : string) : Signer {
    const config = { ...this._config, path }
    return new Signer(this._seckey, config)
  }

  ecdh (pubkey : Bytes) : Buff {
    return get_shared_key(this._seckey, pubkey)
  }

  gen_nonce (
    message  : Bytes,
    options ?: SignerOptions
  ) : Buff {
    const sn = this._gen_nonce(options)(message)
    return get_pubkey(sn, true)
  }

  hmac (message : Bytes) : Buff {
    return hmac512(this._seckey, message)
  }

  musign (
    context  : MusigContext,
    auxdata  : Bytes,
    options ?: SignerOptions
  ) : Buff {
    return this._musign(options)(context, auxdata)
  }

  sign (
    message  : Bytes,
    options ?: SignerOptions
  ) : string {
    return this._sign(options)(message)
  }
}
