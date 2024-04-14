import { Buff, Bytes }        from '@cmdcode/buff'
import { Network, SignerAPI } from '@/core/types/index.js'

import { DEFAULT_CONFIG, get_client_config } from '../config.js'

import {
  Seed,
  Signer,
  Wallet
} from '@cmdcode/signer'

import {
  SignerConfig,
  SignerOptions,
  WalletAPI
} from '../types.js'

import account_api  from '../api/signer/account.js'
import contract_api from '../api/signer/contract.js'
import deposit_api  from '../api/signer/deposit.js'
import proposal_api from '../api/signer/draft.js'
import vmachine_api from '../api/signer/vm.js'
import witness_api  from '../api/signer/witness.js'

import ClientSchema  from '../schema.js'

export class EscrowSigner {
  static create (
    seed     : Bytes,
    options ?: SignerOptions
  ) {
    const signer = new Signer({ seed })
    return new EscrowSigner(signer, options)
  }

  static generate (options ?: SignerOptions) {
    const seed = Buff.random(32)
    return EscrowSigner.create(seed, options)
  }

  static import (options ?: SignerOptions) {
    return {
      from_phrase : (
        phrase : string,
        salt  ?: string | undefined
      ) => {
        const seed = Seed.import.from_char(phrase, salt)
        return EscrowSigner.create(seed, options)
      },
      from_words : (
        words     : string | string[],
        password ?: string | undefined
      ) => {
        const seed = Seed.import.from_words(words, password)
        return EscrowSigner.create(seed, options)
      }
    }
  }

  static restore (
    password : string,
    payload  : string,
    options ?: SignerOptions
  ) {
    const bytes   = Buff.bech32(payload)
    const encdata = bytes.subarray(0, 64)
    const xpub    = bytes.subarray(64).b58chk
    const pass    = Buff.str(password)
    const signer  = Signer.restore(pass, encdata)
    return new EscrowSigner(signer, { ...options, xpub })
  }

  static util = {
    gen_seed  : Seed.generate.bytes,
    gen_words : Seed.generate.words
  }

  readonly _config : SignerConfig
  readonly _signer : SignerAPI
  readonly _wallet : WalletAPI

  constructor (
    signer  : SignerAPI,
    options : SignerOptions = {}
  ) {
    const opt    = { ...DEFAULT_CONFIG, ...options }
    const client = get_client_config(opt.network as Network)
    const config = { ...client, ...opt }
    const xpub   = options.xpub ?? signer.xpub

    this._config = ClientSchema.signer_config.parse(config)
    this._signer = signer
    this._wallet = new Wallet(xpub)
  }

  get machine () {
    return this._config.machine
  }

  get network () {
    return this._config.network
  }

  get pubkey () {
    return this._signer.pubkey
  }

  get server_url () {
    return this._config.server_url
  }

  get server_pol () {
    return this._config.server_pol
  }

  get server_pk () {
    return this._config.server_pk
  }

  get wallet () {
    return {
      newaddr : this._wallet.has_address
    }
  }

  get xpub () {
    return this._wallet.xpub
  }

  account  = account_api(this)
  contract = contract_api(this)
  deposit  = deposit_api(this)
  proposal = proposal_api(this)
  vm       = vmachine_api(this)
  witness  = witness_api(this)

  backup (password : string) {
    const pass    = Buff.str(password)
    const encdata = this._signer.backup(pass)
    const xbytes  = Buff.b58chk(this._wallet.xpub)
    const payload = Buff.join([ encdata, xbytes ])
    return payload.to_bech32('cred')
  }

  check_issuer (pubkey : string) {
    if (pubkey !== this.server_pk) {
      throw new Error('issuer\'s pubkey is not recognized')
    }
  }
}
