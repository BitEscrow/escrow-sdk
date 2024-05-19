import { Buff }           from '@cmdcode/buff'
import { assert }         from '@/core/util/index.js'
import { has_membership } from './membership.js'

import { validate_proposal_data } from '@/core/validation/proposal.js'

import {
  create_proposal,
  endorse_proposal,
  get_path_total,
  get_pay_total
} from '@/core/lib/proposal.js'

import {
  ContractRequest,
  SignerAPI
} from '@/core/types/index.js'

import {
  DraftSession,
  CredentialData,
  DraftTemplate
} from '../types/base.js'

import ClientSchema from '../schema/base.js'

import {
  add_member_data,
  create_role_policy,
  get_role_paths_totals,
  get_role_payment_totals,
  get_role_policy,
  has_open_roles,
  rem_member_data,
  verify_member_data
} from './enrollment.js'

export function create_session (
  template : DraftTemplate
) : DraftSession {
  const { proposal, roles } = template
  return {
    members  : [],
    proposal : create_proposal(proposal),
    roles    : roles.map(e => create_role_policy(e)),
    sigs     : []
  }
}

export function join_session (
  cred      : CredentialData,
  policy_id : string,
  session   : DraftSession
) : DraftSession {
  // Check if member already exists.
  assert.ok(!has_membership(cred, session), 'membership already exists')
  // Check if role is available.
  assert.ok(has_open_roles(policy_id, session), 'all slots are filled for policy id: ' + policy_id)
  const members  = [ ...session.members, { ...cred, pid: policy_id } ]
  //
  const policy   = get_role_policy(policy_id, session)
  // Add member to proposal.
  const proposal = add_member_data(cred, policy, session.proposal)
  //
  return ClientSchema.session.parse({ ...session, members, proposal })
}

export function leave_session (
  cred    : CredentialData,
  session : DraftSession
) : DraftSession {
  //
  const members  = session.members.filter(e => e.pub !== cred.pub)
  // Add member to proposal.
  const proposal = rem_member_data(cred, session.proposal)
  //
  return ClientSchema.session.parse({ ...session, members, proposal })
}

export function reset_session (session : DraftSession) {
  return ClientSchema.session.parse({ ...session, sigs: [] })
}

export function endorse_session (
  session : DraftSession,
  signer  : SignerAPI
) : DraftSession {
  const sig  = endorse_proposal(session.proposal, signer)
  const sigs = [ ...session.sigs, sig ]
  return ClientSchema.session.parse({ ...session, sigs })
}

export function tabualte_session (session : DraftSession) {
  const { paths, payments } = session.proposal
  const prop_path_tabs = get_path_total(paths)
  const prop_pay_total = get_pay_total(payments)
  const role_path_tabs = get_role_paths_totals(session.roles)
  const role_pay_total = get_role_payment_totals(session.roles)

  const prop_path_total = prop_path_tabs
    .map(e => e[1])
    .sort((a, b) => a - b)
    .at(-1) ?? 0
  const role_path_total = role_path_tabs
    .map(e => e[1])
    .sort((a, b) => a - b)
    .at(-1) ?? 0

  const total_tabs = new Map(prop_path_tabs)

  for (const [ label, value ] of role_path_tabs) {
    const curr = total_tabs.get(label) ?? 0
    total_tabs.set(label, curr + value)
  }

  const proj_paths = [ ...total_tabs.entries() ]
    .sort((a, b) => b[1] - a[1])

  return {
    proj_paths,
    proposal : {
      path_tabs  : prop_path_tabs,
      path_total : prop_path_total,
      pay_total  : prop_pay_total
    },
    roles : {
      path_tabs  : role_path_tabs,
      path_total : role_path_total,
      pay_total  : role_pay_total
    }
  }
}

export function verify_session (
  session : DraftSession
) {
  const { members, proposal, roles } = session
  validate_proposal_data(proposal)
  members.forEach(mbr => {
    const pol = roles.find(e => e.id === mbr.pid)
    assert.exists(pol, 'policy does not exist for member: ' + mbr.pub)
    verify_member_data(mbr, proposal, pol)
  })
}

export function publish_session (
  session : DraftSession
) : ContractRequest {
  const { proposal, sigs: endorsements } = session
  return { endorsements, proposal }
}

export function encode_session (session : DraftSession) {
  const json = JSON.stringify(session)
  return Buff.str(json).b64url
}

export function decode_session (session_str : string) : DraftSession {
  const json = Buff.b64url(session_str).str
  const data = JSON.parse(json)
  return ClientSchema.session.parse(data)
}

export const DraftUtil = {
  create   : create_session,
  decode   : decode_session,
  encode   : encode_session,
  endorse  : endorse_session,
  join     : join_session,
  leave    : leave_session,
  publish  : publish_session,
  reset    : reset_session,
  tabulate : tabualte_session,
  verify   : verify_session
}
