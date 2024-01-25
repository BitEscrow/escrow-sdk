import { Wallet }         from '@cmdcode/signer'
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
    const idx = index ?? client._gen_idx()
    return gen_membership(idx, client._signer, client._wallet)
  }
}

export function has_membership_api (
  client : EscrowSigner
) {
  return (proposal : ProposalData) => {
    return has_membership(proposal.members, client._signer)
  }
}

export function claim_membership_api (
  client : EscrowSigner
) {
  return (proposal : ProposalData) : Membership => {
    if (!has_membership(proposal.members, client._signer)) {
      throw new Error('not a member of the proposal')
    }
    const mship = get_membership(proposal.members, client._signer)
    // TODO: validate membership
    return {
      data   : mship,
      signer : client._signer.get_id(mship.id),
      wallet : new Wallet(mship.xpub)
    }
  }
}

export default function (client : EscrowSigner) {
  return {
      claim    : claim_membership_api(client),
      exists   : has_membership_api(client),
      generate : gen_membership_api(client)
  }
}
