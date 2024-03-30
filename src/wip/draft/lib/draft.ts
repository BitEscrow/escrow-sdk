import { create_policy }   from '@/client/lib/policy.js'
import { create_proposal } from '@/core/lib/proposal.js'

import {
  DraftData,
  DraftTemplate,
  RolePolicy
} from '../../../types/index.js'

import * as schema from '@/core/schema/index.js'

export function create_draft (
  template : DraftTemplate
) : DraftData {
  const {
    proposal,
    approvals  = [],
    members    = [],
    roles      = [],
    signatures = [],
    store      = {},
    terms      = []
  } = template

  const prop = create_proposal(proposal)

  const policies = roles.map(e => {
    return (e.id === undefined)
      ? create_policy(e)
      : e as RolePolicy
  })

  const draft = {
    approvals,
    members,
    proposal : prop,
    roles    : policies,
    signatures,
    store,
    terms
  }

  return schema.draft.session.parse(draft)
}
