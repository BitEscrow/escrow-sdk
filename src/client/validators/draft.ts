import {
  get_enrollment,
  tabulate_enrollment
} from '@/client/lib/policy.js'

import {
  compare_arr,
  get_object_id
} from '@/util.js'

import {
  DraftData,
  DraftTemplate,
  MemberData,
  ProgramTerms,
  ProposalData,
  RolePolicy
} from '@/core/types/index.js'

import * as assert from '@/assert.js'
import * as schema from '@/core/schema/index.js'

export function validate_draft_template (
  draft : unknown
) : asserts draft is DraftTemplate {
  void schema.draft.template.parse(draft)
}

export function validate_draft (
  draft : unknown
) : asserts draft is DraftData {
  schema.draft.session.parse(draft)
}

export function validate_policy (
  policy : unknown
) : asserts policy is RolePolicy {
  schema.draft.policy.parse(policy)
}

export function verify_policy (
  policy : RolePolicy
) {
  // add schema check here.
  const { id, ...terms }         = policy
  const { min_slots, max_slots } = terms
  const hash = get_object_id(terms)

  assert.ok(min_slots > 0,          'slot minimum must be greater than zero')
  assert.ok(min_slots <= max_slots, 'slot minimum must not exceed maximum')
  assert.ok(hash.hex === id,       'policy hash does not match id')
}

export function verify_enrollment (
  member   : MemberData,
  policy   : RolePolicy,
  proposal : ProposalData
) {
  const { paths, payment, programs } = get_enrollment(member, proposal)

  if (
    policy.paths !== undefined &&
    !compare_arr(paths, policy.paths)
  ) {
    throw new Error('enrolled paths do not match role template')
  }

  if (
    policy.payment !== undefined &&
    policy.payment > 0           &&
    payment !== policy.payment
  ) {
    throw new Error('enrolled payments do not match role template')
  }

  if (
    policy.programs !== undefined &&
    !check_program_policy(programs, policy.programs)
  ) {
    throw new Error('enrolled programs do not match role template')
  }
}

export function verify_slots (
  members : MemberData[],
  roles   : RolePolicy[]
) {
  const scores = tabulate_enrollment(members, roles)
  roles.forEach(e => {
    const { id, max_slots } = e
    const score = scores.get(id)
    assert.ok(score !== undefined, 'failed to tabulate score for id: ' + id)
    assert.ok(score <= max_slots,  'role is overfilled for id: ' + id)
  })
}

export function verify_slots_full (
  members : MemberData[],
  roles   : RolePolicy[]
) {
  const scores = tabulate_enrollment(members, roles)
  roles.forEach(e => {
    const { id, min_slots } = e
    const score = scores.get(id)
    assert.exists(score)
    assert.ok(score >= min_slots,  'role is not fulfilled for id: ' + id)
  })
}

export function verify_draft (
  draft : DraftData
) {
  const { members, proposal, roles } = draft
  verify_slots(members, roles)
  for (const mbr of members) {
    assert.ok(mbr.pol !== undefined, 'member is not enrolled: ' + mbr.pub)
    const pol = roles.find(e => e.id === mbr.pol)
    assert.ok(pol !== undefined, 'policy does not exist: ' + mbr.pol)
    verify_enrollment(mbr, pol, proposal)
  }
}

function check_program_policy (
  programs : ProgramTerms[],
  policy   : ProgramTerms[]
) {
  for (const pol of policy) {
    const match = programs.find(e => {
      const terms = e.slice(0, pol.length)
      const a1 = JSON.stringify(terms)
      const a2 = JSON.stringify(pol)
      return (a1 === a2)
    })
    if (match === undefined) {
      return false
    }
  }
  return true
}
