import { get_object_id } from '@/lib/util.js'
import { DraftSession }  from '@/client/class/draft.js'

import {
  get_membership,
  has_membership
} from '@/lib/member.js'

import {
  join_role,
  rem_enrollment
} from '@/lib/policy.js'

import { MemberData } from '@/types/index.js'

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

function join_proposal_api (draft : DraftSession) {

  draft._socket.on_event<MemberData>('join', (msg) => {
    const mship = msg.body
    if (mship.pol === undefined || !draft.has_policy(mship.pol)) {
      const err = 'invalid policy id: ' + mship.pol
      draft.log.debug(err)
      draft.emit('reject', [ 'join', mship.pub, err ])
      return
    }
    const policy    = draft.get_policy(mship.pol)
    const new_draft = join_role(mship, policy, draft.data)
    const commit_id = get_object_id(mship).hex
    draft._store.commit(commit_id, new_draft)
  })

  return (
    policy_id : string,
    index    ?: number
  ) => {
    const session = draft.data
    const signer  = draft.signer
    const mship   = (has_membership(session.members, signer._signer))
      ? get_membership(session.members, signer._signer)
      : signer.credential.generate(index)
    mship.pol = policy_id
    const commit_id = get_object_id(mship).hex
    const receipt   = draft._store.on_commit(commit_id)
    draft._socket.send('join', mship)
    return receipt
  }
}

function leave_proposal_api (draft : DraftSession) {

  draft._socket.on_event<MemberData>('leave', (msg) => {
    const mship     = msg.body
    const session   = rem_enrollment(mship, draft.data)
    const commit_id = get_object_id(mship).hex
    draft._store.commit(commit_id, session)
  })

  return () => {
    const members = draft.data.members
    const signer  = draft.signer   
    if (has_membership(members, signer._signer)) {
      const cred      = signer.credential.claim(members)
      const mship     = cred.data
      const commit_id = get_object_id(mship).hex
      const receipt   = draft._store.on_commit(commit_id)
      draft._socket.send('leave', mship)
      return receipt
    }
    return
  }
}

export default function (draft : DraftSession) {
  return {
    claim  : claim_membership_api(draft),
    exists : membership_exists_api(draft),
    join   : join_proposal_api(draft),
    leave  : leave_proposal_api(draft)
  }
}
