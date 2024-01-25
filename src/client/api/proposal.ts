import { EscrowSigner }     from '@/client/class/signer.js'
import { endorse_proposal } from '@/lib/proposal.js'
import { parse_proposal }   from '@/lib/parse.js'
import { verify_proposal }  from '@/validators/proposal.js'

import {
  add_membership,
  rem_membership
} from '@/lib/policy.js'

import { ProposalData, RolePolicy } from '@/types/index.js'

export function is_member_api (signer : EscrowSigner) {
  return (proposal : ProposalData) => {
    return signer.membership.exists(proposal)
  }
}

export function join_proposal_api (signer : EscrowSigner) {
  return (
    proposal : ProposalData,
    role     : RolePolicy,
    index   ?: number
  ) => {
    const idx  = index ?? signer._gen_idx()
    const cred = signer.membership.generate(idx)
    return add_membership(cred, role, proposal)
  }
}

export function leave_proposal_api (signer : EscrowSigner) {
  return (proposal : ProposalData) => {
    const mship = signer.membership.claim(proposal)
    return rem_membership(mship.data, proposal, true)
  }
}

export function endorse_proposal_api (client : EscrowSigner) {
  return (proposal : ProposalData) => {
    const prop = parse_proposal(proposal)
    verify_proposal(prop)
    return endorse_proposal(prop, client._signer)
  }
}

export default function (signer : EscrowSigner) {
  return {
    endorse   : endorse_proposal_api(signer),
    is_member : is_member_api(signer),
    join      : join_proposal_api(signer),
    leave     : leave_proposal_api(signer)
  }
}
