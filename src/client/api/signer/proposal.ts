import { endorse_proposal } from '@/core/lib/proposal.js'
import { ProposalData }     from '@/core/types/index.js'
import { verify_proposal }  from '@/core/validators/proposal.js'

import { EscrowSigner } from '../../class/signer.js'
import { RolePolicy }   from '../../types.js'

import { add_member, rem_member } from '../../lib/proposal.js'

export function join_proposal_api (esigner : EscrowSigner) {
  return (
    policy   : RolePolicy,
    proposal : ProposalData
  ) : ProposalData => {
    const pubkey = esigner.pubkey
    const xpub   = esigner.xpub
    return add_member(policy, proposal, pubkey, xpub)
  }
}

export function leave_proposal_api (esigner : EscrowSigner) {
  return (proposal : ProposalData) : ProposalData => {
    const pubkey = esigner.pubkey
    const xpub   = esigner.xpub
    return rem_member(proposal, pubkey, xpub)
  }
}

export function endorse_proposal_api (esigner : EscrowSigner) {
  return (proposal : ProposalData) : string => {
    const { machine, server_pol } = esigner
    verify_proposal(machine, server_pol, proposal)
    return endorse_proposal(proposal, esigner._signer)
  }
}

export default function (esigner : EscrowSigner) {
  return {
    endorse : endorse_proposal_api(esigner),
    join    : join_proposal_api(esigner),
    leave   : leave_proposal_api(esigner)
  }
}
