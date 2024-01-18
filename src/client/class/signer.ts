import { Buff }           from '@cmdcode/buff'
import { Signer, Wallet } from '@cmdcode/signer'
import { SignerConfig }   from '@/client/types.js'
import { EscrowClient }   from './client.js'

import deposit_api from '../api/depositor.js'
import endorse_api from '../api/endorse.js'
import request_api from '../api/request.js'

import {
  claim_membership_api,
  gen_membership_api,
  has_membership_api
} from '@/client/api/member.js'

import {
  CredSignerAPI,
  WalletAPI
} from '@/types/index.js'

const DEFAULT_IDXGEN = () => Buff.now(4).num

export class EscrowSigner {

  static load (
    password : string,
    payload  : string
  ) {
    const bytes   = Buff.bech32(payload)
    const encdata = bytes.subarray(0, 96)
    const xpub    = bytes.subarray(96).b58chk
    const pass    = Buff.str(password)
    const signer  = Signer.restore(pass, encdata)
    const wallet  = new Wallet(xpub)
    return new EscrowSigner({ signer, wallet })
  }

  readonly _client  : EscrowClient
  readonly _gen_idx : () => number
  readonly _signer  : CredSignerAPI
  readonly _wallet  : WalletAPI

  constructor (config : SignerConfig) {
    this._client  = new EscrowClient(config)
    this._gen_idx = config.idxgen ?? DEFAULT_IDXGEN
    this._signer  = config.signer
    this._wallet  = config.wallet
  }

  get client () {
    return this._client
  }

  get pubkey () {
    return this._signer.pubkey
  }

  deposit = deposit_api(this)
  endorse = endorse_api(this)
  request = request_api(this)

  gen_membership = gen_membership_api(this)
  get_membership = claim_membership_api(this)
  has_membership = has_membership_api(this)

  save (password : string) {
    const pass    = Buff.str(password)
    const encdata = this._signer.backup(pass)
    const xbytes  = Buff.b58chk(this._wallet.xpub)
    const payload = Buff.join([ encdata, xbytes ])
    return payload.to_bech32('cred')
  }
}
