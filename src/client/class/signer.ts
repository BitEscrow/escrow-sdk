import { Buff } from '@cmdcode/buff'

import { get_proposal_id } from '@/lib/proposal.js'
import { sign_witness }    from '@/lib/witness.js'
import { ClientConfig }    from '@/client/types.js'

import depositor_api from '@/client/api/depositor.js'
import member_api    from '@/client/api/member.js'

import {
  ContractData,
  ProposalData,
  SignerAPI,
  WalletAPI,
  WitnessTemplate
} from '@/types/index.js'
import { validate_witness } from '@/validators/program.js'
import { validate_proposal, verify_proposal } from '@/validators/proposal.js'

const DEFAULT_IDXGEN = () => Buff.now(4).num

export class EscrowSigner {

  readonly _gen_idx : () => number
  readonly _signer  : SignerAPI
  readonly _wallet  : WalletAPI

  constructor (config : ClientConfig) {
    this._gen_idx = config.idxgen   ?? DEFAULT_IDXGEN
    this._signer  = config.signer
    this._wallet  = config.wallet
  }

  get new_idx () {
    return this._gen_idx()
  }

  get signer () {
    return this._signer
  }

  get wallet () {
    return this._wallet
  }

  deposit    = depositor_api(this)
  membership = member_api(this)

  sign_proposal (proposal : ProposalData) {
    validate_proposal(proposal)
    verify_proposal(proposal)
    const hash = get_proposal_id(proposal)
    return this.signer.sign(hash)
  }

  sign_request (
    url    : string, 
    body   : string = '{}',
    method : string = 'GET'
  ) {
    const content = method + url + body
    return this.signer.gen_token(content)
  }

  sign_witness (
    contract : ContractData,
    witness  : WitnessTemplate
  ) {
    const cred = this.membership.claim(contract.terms)
    validate_witness(contract, witness)
    return sign_witness(cred.signer, witness)
  }

}
