import { Wallet }       from '@cmdcode/signer'
import { EscrowSigner } from '@/client/class/signer.js'
import { ProposalData } from '@/types/index.js'

import {
  gen_membership,
  get_membership,
  has_membership,
} from '../../lib/member.js'

import { Membership } from '../types.js'

function gen_membership_api (client : EscrowSigner) {
  return (index ?: number) => {
    const { signer, wallet } = client
    const idx = index ?? client.new_idx
    return gen_membership(idx, signer, wallet)
  }
}

function has_membership_api (
  client : EscrowSigner
) {
  return (proposal : ProposalData) => {
    return has_membership(proposal.members, client.signer)
  }
}

function claim_membership_api (
  client : EscrowSigner
) {
  const { signer } = client
  return (proposal : ProposalData) : Membership => {
    if (!has_membership(proposal.members, signer)) {
      throw new Error('not a member of the proposal')
    }
    const mship = get_membership(proposal.members, signer)
    // TODO: validate membership
    return {
      signer : client.signer.get_id(mship.id),
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
