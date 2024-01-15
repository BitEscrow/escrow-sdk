import { endorse_proposal } from '@/lib/proposal.js'
import { sign_witness }     from '@/lib/witness.js'
import { EscrowContract }   from '@/client/class/contract.js'
import { EscrowSigner }     from '@/client/class/signer.js'
import { EscrowProposal }   from '@/client/class/proposal.js'
import { validate_witness } from '@/validators/program.js'

import {
  validate_proposal,
  verify_proposal
} from '@/validators/proposal.js'

import {
  ContractData,
  ProposalData,
  WitnessData
} from '@/types/index.js'

export function endorse_proposal_api (client : EscrowSigner) {
  return (proposal : ProposalData | EscrowProposal) => {
    if (proposal instanceof EscrowProposal) {
      proposal = proposal.data
    }
    validate_proposal(proposal)
    verify_proposal(proposal)
    return endorse_proposal(proposal, client._signer)
  }
}

export function endorse_request_api (client : EscrowSigner) {
  return (
    url    : string, 
    body   : string = '{}',
    method : string = 'GET'
  ) => {
    const content = method + url + body
    return client._signer.gen_token(content)
  }
}

export function endorse_witness_api (client : EscrowSigner) {
  return (
    contract : ContractData | EscrowContract,
    witness  : WitnessData
  ) => {
    if (contract instanceof EscrowContract) {
      contract = contract.data
    }
    const cred = client.get_membership(contract.terms)
    validate_witness(contract, witness)
    return sign_witness(cred.signer, witness)
  }
}

export default function (client : EscrowSigner) {
  return {
    proposal : endorse_proposal_api(client),
    request  : endorse_request_api(client),
    witness  : endorse_witness_api(client)
  }
}