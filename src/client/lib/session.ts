import { Buff }   from '@cmdcode/buff'
import { assert } from '@/core/util/index.js'

import {
  create_proposal,
  get_proposal_id
} from '@/core/lib/proposal.js'

import {
  ContractRequest,
  ProposalTemplate,
  SignerAPI
} from '@/core/types/index.js'

import {
  RoleTemplate,
  DraftSession
} from '../types.js'

import ClientSchema from '../schema.js'

import {
  claim_credential,
  get_signatures,
  has_credential,
  parse_credential,
  update_credential
} from './credential.js'

import {
  add_member_data,
  create_role_policy,
  get_role_policy,
  has_open_slots,
  rem_member_data
} from './enrollment.js'

export function create_session (
  proposal : ProposalTemplate,
  roles    : RoleTemplate[]
) : DraftSession {
  return {
    members  : [],
    proposal : create_proposal(proposal),
    roles    : roles.map(e => create_role_policy(e))
  }
}

export function join_session (
  mship   : string,
  pol_id  : string,
  session : DraftSession
) : DraftSession {
  // Check if member already exists.
  assert.ok(!has_credential(mship, session), 'membership already exists')
  // Check if role is available.
  assert.ok(has_open_slots(pol_id, session), 'all slots are filled for policy id: ' + pol_id)
  const members  = [ ...session.members, [ mship, pol_id ] ]
  //
  const policy   = get_role_policy(pol_id, session)
  // Add member to proposal.
  const proposal = add_member_data(mship, policy, session.proposal)
  //
  return ClientSchema.session.parse({ ...session, members, proposal })
}

export function leave_session (
  mship   : string,
  session : DraftSession
) : DraftSession {
  //
  const members  = session.members.filter(e => e[0] === mship)
  // Add member to proposal.
  const proposal = rem_member_data(mship, session.proposal)
  //
  return ClientSchema.session.parse({ ...session, members, proposal })
}

export function endorse_session (
  session : DraftSession,
  signer  : SignerAPI
) : DraftSession {
  // get and verify membership.
  const mship = claim_credential(session.members, signer)
  //
  assert.ok(mship !== null, 'signer is not a member of the session')
  //
  const { hid } = parse_credential(mship[0])
  const prop_id = get_proposal_id(session.proposal)
  const preimg  = Buff.join([ prop_id, hid ])
  const sig     = signer.get_id(hid).sign(preimg)
  const cred    = ClientSchema.mship.parse([ ...mship, sig ])
  const members = update_credential(session.members, cred)
  // add signature that signs proposal id.
  return ClientSchema.session.parse({ ...session, members })
}

export function verify_session (
  session : DraftSession
) {
  // verify enrollment
  // verify signatures
  console.log(session)
}

export function publish_session (
  session : DraftSession
) : ContractRequest {
  const { proposal } = session
  const signatures   = get_signatures(session.members)
  return { proposal, signatures }
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
  create  : create_session,
  decode  : decode_session,
  encode  : encode_session,
  publish : publish_session,
  verify  : verify_session
}
