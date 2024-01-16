import { Buff }         from '@cmdcode/buff'
import { SignerConfig } from '@/client/types.js'
import { EscrowClient } from './client.js'

import deposit_api from '../api/depositor.js'
import endorse_api from '../api/endorse.js'
import request_api from '../api/request.js'

import {
  claim_membership_api,
  gen_membership_api,
  has_membership_api
} from '@/client/api/member.js'

import {
  SignerAPI,
  WalletAPI
} from '@/types/index.js'

const DEFAULT_IDXGEN = () => Buff.now(4).num

export class EscrowSigner {

  readonly _client  : EscrowClient
  readonly _gen_idx : () => number
  readonly _signer  : SignerAPI
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

}
