import { Buff, Bytes }    from '@cmdcode/buff'
import { Signer, Wallet } from '@cmdcode/signer'
import { EscrowClient }   from './client.js'

import deposit_api  from '../api/depositor.js'
import member_api   from '../api/member.js'
import proposal_api from '../api/proposal.js'
import request_api  from '../api/request.js'
import witness_api  from '../api/witness.js'

import {
  ClientConfig,
  SignerConfig
} from '@/client/types.js'

import {
  CredSignerAPI,
  Network,
  WalletAPI
} from '@/types/index.js'

const DEFAULT_IDXGEN = () => Buff.now(4).num

export class EscrowSigner {

  static create (
    config : ClientConfig,
    seed   : Bytes,
    xpub  ?: string
  ) {
    const signer = new Signer({ seed })
    const wallet = (xpub !== undefined)
      ? new Wallet(xpub)
      : Wallet.generate({ seed, network : config.network as Network })
    return new EscrowSigner({ ...config, signer, wallet })
  }

  static load (
    config   : ClientConfig,
    password : string,
    payload  : string
  ) {
    const bytes   = Buff.bech32(payload)
    const encdata = bytes.subarray(0, 96)
    const xpub    = bytes.subarray(96).b58chk
    const pass    = Buff.str(password)
    const signer  = Signer.restore(pass, encdata)
    const wallet  = new Wallet(xpub)
    return new EscrowSigner({ ...config, signer, wallet })
  }

  readonly _client    : EscrowClient
  readonly _host_pub ?: string
  readonly _gen_idx   : () => number
  readonly _signer    : CredSignerAPI
  readonly _wallet    : WalletAPI

  constructor (config : SignerConfig) {
    this._client   = new EscrowClient(config)
    this._gen_idx  = config.idxgen ?? DEFAULT_IDXGEN
    this._host_pub = config.host_pub
    this._signer   = config.signer
    this._wallet   = config.wallet
  }

  get client () {
    return this._client
  }

  get host_pub () {
    return this._host_pub
  }

  get pubkey () {
    return this._signer.pubkey
  }

  deposit    = deposit_api(this)
  membership = member_api(this)
  proposal   = proposal_api(this)
  request    = request_api(this)
  witness    = witness_api(this)

  save (password : string) {
    const pass    = Buff.str(password)
    const encdata = this._signer.backup(pass)
    const xbytes  = Buff.b58chk(this._wallet.xpub)
    const payload = Buff.join([ encdata, xbytes ])
    return payload.to_bech32('cred')
  }
}
