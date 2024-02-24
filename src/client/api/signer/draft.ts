import { EscrowSigner }     from '@/client/class/signer.js'
import { endorse_proposal } from '@/lib/proposal.js'
import { parse_proposal }   from '@/lib/parse.js'

import {
  add_enrollment,
  rem_enrollment
} from '@/lib/policy.js'

import {
  validate_draft,
  verify_draft,
  verify_slots_full
} from '@/validators/draft.js'

import {
  DraftData,
  MemberData,
  RolePolicy
} from '@/types/index.js'

import { verify_proposal } from '@/validators/proposal.js'

import * as assert from '@/assert.js'

export function is_member_api (signer : EscrowSigner) {
  return (members : MemberData[]) => {
    return signer.credential.exists(members)
  }
}

export function join_draft_api (signer : EscrowSigner) {
  return (
    policy  : RolePolicy,
    session : DraftData,
    index   ?: number
  ) => {
    const idx  = index ?? signer._gen_idx()
    const cred = signer.credential.generate(idx)
    return add_enrollment(cred, policy, session)
  }
}

export function leave_draft_api (signer : EscrowSigner) {
  return (session : DraftData) => {
    const members = session.members
    const mship   = signer.credential.claim(members)
    return rem_enrollment(mship.data, session)
  }
}

export function approve_draft_api (client : EscrowSigner) {
  return (draft : DraftData) => {
    const cred   = client.credential
    const is_mbr = cred.exists(draft.members)
    assert.ok(is_mbr,            'signer is not a member of the draft')
    const mship  = cred.claim(draft.members)
    const app    = draft.approvals.find(e => e.slice(0, 64) === mship.data.pub)
    assert.ok(app === undefined, 'signer already approved the draft')
    validate_draft(draft)
    verify_draft(draft)
    verify_slots_full(draft.members, draft.roles)
    verify_proposal(draft.proposal)
    const prop = parse_proposal(draft.proposal)
    return endorse_proposal(prop, mship.signer)
  }
}

export function endorse_draft_api (client : EscrowSigner) {
  return (draft : DraftData) => {
    validate_draft(draft)
    verify_draft(draft)
    verify_slots_full(draft.members, draft.roles)
    verify_proposal(draft.proposal)
    const prop = parse_proposal(draft.proposal)
    return endorse_proposal(prop, client._signer)
  }
}

export default function (signer : EscrowSigner) {
  return {
    approve   : approve_draft_api(signer),
    endorse   : endorse_draft_api(signer),
    is_member : is_member_api(signer),
    join      : join_draft_api(signer),
    leave     : leave_draft_api(signer)
  }
}
