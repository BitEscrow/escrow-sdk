import { Buff }             from '@cmdcode/buff'
import { get_proposal_id }  from '@/lib/proposal.js'
import { sign_witness }     from '@/lib/witness.js'
import { SignerConfig }     from '@/client/types.js'
import { validate_witness } from '@/validators/program.js'

import { EscrowContract }   from './contract.js'
import { EscrowProposal }   from './proposal.js'

import {
  validate_proposal,
  verify_proposal
} from '@/validators/proposal.js'

import {
  create_deposit_api,
  create_return_api,
  fund_contract_api
} from '@/client/api/depositor.js'

import {
  claim_membership_api,
  gen_membership_api,
  has_membership_api
} from '@/client/api/member.js'

import {
  ContractData,
  ProposalData,
  SignerAPI,
  WalletAPI,
  WitnessData
} from '@/types/index.js'

const DEFAULT_IDXGEN = () => Buff.now(4).num

export class EscrowSigner {

  readonly _gen_idx : () => number
  readonly _signer  : SignerAPI
  readonly _wallet  : WalletAPI

  constructor (config : SignerConfig) {
    this._gen_idx = config.idxgen   ?? DEFAULT_IDXGEN
    this._signer  = config.signer
    this._wallet  = config.wallet
  }

  get pubkey () {
    return this._signer.pubkey
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

  /**
   * endorse = {
   *   proposal
   *   request
   *   witness
   * }
   *
   * deposit = {
   *   register
   *   commit
   *   cancel
   * }
   * 
   * membership = {
   *   create
   *   claim
   *   exists
   * }
   */
  
  gen_membership = gen_membership_api(this)
  get_membership = claim_membership_api(this)
  has_membership = has_membership_api(this)

  create_deposit = create_deposit_api(this)
  create_refund  = create_return_api(this)
  fund_contract  = fund_contract_api(this)

  sign_proposal (proposal : ProposalData | EscrowProposal) {
    if (proposal instanceof EscrowProposal) {
      proposal = proposal.data
    }
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
    contract : ContractData | EscrowContract,
    witness  : WitnessData
  ) {
    if (contract instanceof EscrowContract) {
      contract = contract.data
    }
    const cred = this.get_membership(contract.terms)
    validate_witness(contract, witness)
    return sign_witness(cred.signer, witness)
  }

}
