import { get_proposal_id }  from '@/lib/proposal.js'
import { sign_witness }     from '@/lib/witness.js'
import { EscrowContract }   from '@/client/class/contract.js'
import { EscrowMember }     from '@/client/class/member.js'
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

export function endorse_proposal_api (member : EscrowMember) {
  return (proposal : ProposalData | EscrowProposal) => {
    if (proposal instanceof EscrowProposal) {
      proposal = proposal.data
    }
    validate_proposal(proposal)
    verify_proposal(proposal)
    const hash = get_proposal_id(proposal)
    return member.signer.sign(hash)
  }
}
  
export function endorse_request_api (member : EscrowMember) {
  return (
    url    : string, 
    body   : string = '{}',
    method : string = 'GET'
  ) => {
    const content = method + url + body
    return member.signer.gen_token(content)
  }
}

export function endorse_witness_api (member : EscrowMember) {
  return (
    contract : ContractData | EscrowContract,
    witness  : WitnessData
  ) => {
    if (contract instanceof EscrowContract) {
      contract = contract.data
    }
    const cred = member.get_membership(contract.terms)
    validate_witness(contract, witness)
    return sign_witness(cred.signer, witness)
  }
}

export default function (client : EscrowMember) {
  return {
    proposal : endorse_proposal_api(client),
    request  : endorse_request_api(client),
    witness  : endorse_witness_api(client)
  }
}
