import { Wallet }         from '@cmdcode/signer'
import { EscrowProposal } from '@/client/class/proposal.js'
import { EscrowSigner }   from '@/client/class/signer.js'
import { ProposalData }   from '@/types/index.js'

import {
  gen_membership,
  get_membership,
  has_membership,
} from '../../lib/member.js'

import { Membership } from '../types.js'


export function gen_membership_api (client : EscrowSigner) {
  return (index ?: number) => {
    const { signer, wallet } = client
    const idx = index ?? client.new_idx
    return gen_membership(idx, signer, wallet)
  }
}

export function has_membership_api (
  client : EscrowSigner
) {
  return (proposal : ProposalData | EscrowProposal) => {
    if (proposal instanceof EscrowProposal) {
      proposal = proposal.data
    }
    return has_membership(proposal.members, client.signer)
  }
}

export function claim_membership_api (
  client : EscrowSigner
) {
  const { signer } = client
  return (proposal : ProposalData | EscrowProposal) : Membership => {
    if (proposal instanceof EscrowProposal) {
      proposal = proposal.data
    }
    if (!has_membership(proposal.members, signer)) {
      throw new Error('not a member of the proposal')
    }
    const mship = get_membership(proposal.members, signer)
    // TODO: validate membership
    return {
      signer : client.signer.get_id(mship.id),
      token  : mship,
      wallet : new Wallet(mship.xpub)
    }
  }
}

export default function (client : EscrowSigner) {
  return {
      claim  : claim_membership_api(client),
      create : gen_membership_api(client),
      exists : has_membership_api(client)
  }
}
