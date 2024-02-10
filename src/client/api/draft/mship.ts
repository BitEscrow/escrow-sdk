import { DraftSession } from '@/client/class/draft.js'

import {
  get_membership,
  has_membership
} from '@/lib/member.js'

import {
  add_enrollment,
  join_role,
  rem_enrollment
} from '@/lib/policy.js'

import { RolePolicy } from '@/types/index.js'

function membership_exists_api (draft : DraftSession) {
  return () => {
    const signer  = draft.signer
    const members = draft.members
    return signer.credential.exists(members)
  }
}

function claim_membership_api (draft : DraftSession) {
  return () => {
    const signer  = draft.signer
    const members = draft.members
    return signer.credential.claim(members)
  }
}

function create_membership_api (draft : DraftSession) {
  return (
    policy : RolePolicy,
    index ?: number
  ) => {
      let session = draft.data
    const members = draft.data.members
    const signer  = draft.signer
    const mship   = (has_membership(members, signer._signer))
      ? get_membership(members, signer._signer)
      : signer.credential.generate(index)
    session = add_enrollment(mship, policy, draft.data)
    return draft._store.patch(session)
  }
}

function join_proposal_api (draft : DraftSession) {
  return (
    policy : RolePolicy,
    index ?: number
  ) => {
      let session = draft.data
    const members = draft.data.members
    const signer  = draft.signer
    const mship   = (has_membership(members, signer._signer))
      ? get_membership(members, signer._signer)
      : signer.credential.generate(index)
    session = join_role(mship, policy, draft.data)
    return draft._store.patch(session)
  }
}

function leave_proposal_api (draft : DraftSession) {
  return () => {
    const members = draft.data.members
    const signer  = draft.signer   
    if (has_membership(members, signer._signer)) {
      const cred    = signer.credential.claim(members)
      const session = rem_enrollment(cred.data, draft.data)
      return draft._store.post(session)
    } else {
      return
    }
  }
}

export default function (draft : DraftSession) {
  return {
    claim  : claim_membership_api(draft),
    create : create_membership_api(draft),
    exists : membership_exists_api(draft),
    join   : join_proposal_api(draft),
    leave  : leave_proposal_api(draft)
  }
}
