import { Buff, Bytes }    from '@cmdcode/buff'
import { EscrowClient }   from './client.js'
import { SignerConfig }   from '../types.js'

import {
  Seed,
  Signer,
  Wallet
} from '@cmdcode/signer'

import account_api  from '../api/account.js'
import member_api   from '../api/member.js'
import proposal_api from '../api/proposal.js'
import request_api  from '../api/request.js'
import witness_api  from '../api/witness.js'

import {
  CredSignerAPI,
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
      : Wallet.generate({ seed, network : config.network as Network })
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
  readonly _signer    : CredSignerAPI
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

  account    = account_api(this)
  membership = member_api(this)
  proposal   = proposal_api(this)
  request    = request_api(this)
  witness    = witness_api(this)

  has_account (xpub : string) {
    return this._wallet.has_account(xpub)
  }

  get_account (idx ?: number) {
    idx = idx ?? this._gen_idx()
    return this._wallet.get_account(idx)
  }

  save (password : string) {
    const pass    = Buff.str(password)
    const encdata = this._signer.backup(pass)
    const xbytes  = Buff.b58chk(this._wallet.xpub)
    const payload = Buff.join([ encdata, xbytes ])
    return payload.to_bech32('cred')
  }
}
