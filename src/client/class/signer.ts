import { Buff, Bytes }  from '@cmdcode/buff'
import { EscrowClient } from './client.js'
import { SignerConfig } from '../types.js'

import {
  Seed,
  Signer,
  Wallet,
} from '@cmdcode/signer'

import account_api   from '../api/signer/account.js'
import fetch_api     from '../api/signer/fetch.js'
import member_api    from '../api/signer/member.js'
import draft_api     from '../api/signer/draft.js'
import request_api   from '../api/signer/request.js'
import statement_api from '../api/signer/statement.js'
import wallet_api    from '../api/signer/wallet.js'

import {
  CredentialAPI,
  Network,
  WalletAPI
} from '@/types/index.js'

const DEFAULT_IDXGEN = () => Buff.now(4).num

export class EscrowSigner {

  static create (
    config : Partial<SignerConfig>,
    seed   : Bytes,
    xpub  ?: string
  ) {
    const signer = new Signer({ seed })
    const wallet = (xpub !== undefined)
      ? new Wallet(xpub)
      : Wallet.create({ seed, network : config.network as Network })
    return new EscrowSigner({ ...config, signer, wallet })
  }

  static generate (
    config : Partial<SignerConfig>,
    xpub  ?: string
  ) {
    const seed = Buff.random(32)
    return EscrowSigner.create(config, seed, xpub)
  }

  static import (
    config : Partial<SignerConfig>,
    xpub  ?: string
  ) {
    return {
      from_phrase : (
        phrase : string,
        salt  ?: string | undefined
      ) => {
        const seed = Seed.import.from_char(phrase, salt)
        return EscrowSigner.create(config, seed, xpub)
      },
      from_words : (
        words     : string | string[],
        password ?: string | undefined
      ) => {
        const seed = Seed.import.from_words(words, password)
        return EscrowSigner.create(config, seed, xpub)
      }
    }
  }

  static load (
    config   : Partial<SignerConfig>,
    password : string,
    payload  : string
  ) {
    const bytes   = Buff.bech32(payload)
    const encdata = bytes.subarray(0, 64)
    const xpub    = bytes.subarray(64).b58chk
    const pass    = Buff.str(password)
    const signer  = Signer.restore(pass, encdata)
    const wallet  = new Wallet(xpub)
    return new EscrowSigner({ ...config, signer, wallet })
  }

  static util = {
    gen_seed  : Seed.generate.bytes,
    gen_words : Seed.generate.words
  }

  readonly _client    : EscrowClient
  readonly _host_pub ?: string
  readonly _gen_idx   : () => number
  readonly _signer    : CredentialAPI
  readonly _wallet    : WalletAPI

  constructor (config : SignerConfig) {
    this._client   = new EscrowClient(config)
    this._gen_idx  = config.idxgen ?? DEFAULT_IDXGEN
    this._host_pub = config.host_pubkey
    this._signer   = config.signer
    this._wallet   = config.wallet
  }

  get client () {
    return this._client
  }

  get host_pub () {
    return this._host_pub
  }

  get network () {
    return this._client.network
  }

  get pubkey () {
    return this._signer.pubkey
  }

  get xpub () {
    return this._wallet.xpub
  }

  account    = account_api(this)
  credential = member_api(this)
  draft      = draft_api(this)
  fetch      = fetch_api(this)
  request    = request_api(this)
  wallet     = wallet_api(this)
  witness    = statement_api(this)

  save (password : string) {
    const pass    = Buff.str(password)
    const encdata = this._signer.backup(pass)
    const xbytes  = Buff.b58chk(this._wallet.xpub)
    const payload = Buff.join([ encdata, xbytes ])
    return payload.to_bech32('cred')
  }
}
