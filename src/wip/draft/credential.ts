import { Wallet }       from '@cmdcode/signer'
import { EscrowSigner } from '@/client/class/signer.js'
import { MemberData }   from '@/core/types/index.js'
import { Membership }   from '../../types/index.js'

import {
  gen_membership,
  get_membership,
  has_credential,
  has_membership
} from '@/client/lib/member.js'

export function gen_membership_api (client : EscrowSigner) {
  return (index ?: number) => {
    const idx = index ?? client._gen_idx()
    return gen_membership(idx, client._signer, client._wallet)
  }
}

export function has_membership_api (
  client : EscrowSigner
) {
  return (members : MemberData[]) => {
    return has_membership(members, client._signer)
  }
}

export function is_claimable_api (
  client : EscrowSigner
) {
  return (cred : MemberData) => {
    return has_credential(cred, client._signer)
  }
}

export function claim_membership_api (
  client : EscrowSigner
) {
  return (members : MemberData[]) : Membership => {
    if (!has_membership(members, client._signer)) {
      throw new Error('not a member of the proposal')
    }
    const mship = get_membership(members, client._signer)

    return {
      data   : mship,
      signer : client._signer.get_id(mship.id),
      wallet : new Wallet(mship.xpub)
    }
  }
}

export default function (client : EscrowSigner) {
  return {
    claimable : is_claimable_api(client),
    claim     : claim_membership_api(client),
    exists    : has_membership_api(client),
    generate  : gen_membership_api(client)
  }
}
