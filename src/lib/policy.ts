import { Wallet } from '@cmdcode/signer'

import {
  rem_member_data,
  upsert_member_data
} from './member.js'

import {
  find_program_idx,
  get_object_id
} from '../lib/util.js'

import {
  DraftData,
  MemberData,
  ProposalData,
  RolePolicy,
  RoleTemplate
} from '@/types/index.js'

import * as assert from '@/assert.js'

const GET_DEFAULT_POLICY = () => {
  return {
    min_slots : 1,
    max_slots : 1,
    paths     : [],
    programs  : []
  }
}

export function create_policy (
  template : RoleTemplate
) : RolePolicy {
  const pol = { ...GET_DEFAULT_POLICY(), ...template }
  const id  = get_object_id(pol).hex
  return { ...pol, id }
}

export function get_enrollment (
  member   : MemberData,
  proposal : ProposalData
) {
  const { pub, xpub } = member
  const wallet = new Wallet(xpub)
  const paths  = proposal.paths
    .filter(e => wallet.has_address(e[2]), proposal.paths.length)
    .map(e => [ e[0], e[1] ] as [ string, number ])
  const payment = proposal.payments
    .filter(e => wallet.has_address(e[1]), proposal.payments.length)
    .reduce((p, n) => p + n[0], 0)
  const programs = proposal.programs
    .filter(e => e.includes(pub))
  return { paths, payment, programs }
}

export function tabulate_enrollment (
  members : MemberData[],
  roles   : RolePolicy[],
) {
  const scores = new Map(roles.map(e => [ e.id, 0 ]))
  for (const pol of roles) {
    const tab = scores.get(pol.id)
    assert.exists(tab)
    for (const mbr of members) {
      if (mbr.pol === pol.id) {
        scores.set(pol.id, tab + 1)
      }
    }
  }
  return scores
}

export function has_full_enrollment (
  members : MemberData[],
  roles   : RolePolicy[]
) {
  const scores = tabulate_enrollment(members, roles)
  return roles.every(e => {
    const { id, min_slots, max_slots } = e
    const score = scores.get(id)
    return (
      score !== undefined && 
      score >= min_slots  && 
      score <= max_slots
    )
  })
}

export function has_policy (
  pol_id : string,
  roles  : RolePolicy[]
) {
  const exists = roles.find(e => e.id === pol_id)
  return exists !== undefined
}

export function is_enrolled (
  members  : MemberData[],
  mship    : MemberData,
) {
  return members.some(e => {
    return e.pub === mship.pub && e.pol !== undefined
  })
}

export function add_enrollment (
  membership : MemberData,
  policy     : RolePolicy,
  session    : DraftData
) {
  let roles = session.roles,
      sdata = session

  if (!has_policy(policy.id, roles)) {
    roles = [ ...session.roles, policy ]
    sdata = { ...session, roles }
  }

  return join_role(membership, policy, sdata)
}

export function join_role (
  membership : MemberData,
  policy     : RolePolicy,
  session    : DraftData
) : DraftData {
  const { pub, xpub } = membership

  const updated = rem_enrollment(membership, session)

  const { members, roles, proposal } = updated
  const { network, paths, payments, programs } = proposal

  if (!has_policy(policy.id, roles)) {
    throw new Error('policy does not exist')
  }

  const wallet = new Wallet(xpub)
  const rolls  = members.filter(e => e.pol === policy.id)
  const limit  = policy.max_slots
  
  if (rolls.length >= limit) {
    throw new Error('no slots remaining for role')
  }

  if (policy.paths !== undefined) {
    for (const [ label, amt ] of policy.paths) {
      const addr = wallet.new_address({ network })
      paths.push([ label, amt, addr ])
    }
  }

  if (policy.payment !== undefined && policy.payment > 0) {
    const pay_addr = wallet.new_address({ network })
    payments.push([ policy.payment, pay_addr ])
  }

  if (policy.programs !== undefined) {
    for (const terms of policy.programs) {
      const idx = find_program_idx(programs, terms)
      if (idx === null) {
        programs.push([ ...terms, pub ])
      } else {
        programs[idx].push(pub)
      }
    }
  }

  const mship = { ...membership, pol : policy.id }
  const tmpl  = { ...proposal, paths, payments, programs }
  const mbrs  = upsert_member_data(members, mship)

  return { ...session, members : mbrs, proposal : tmpl, signatures : [] }
}

export function rem_enrollment (
  membership : MemberData,
  session    : DraftData
) : DraftData {
  const { pub, xpub }         = membership
  const { members, proposal } = session

  const wallet   = new Wallet(xpub)

  const paths    = proposal.paths
    .filter(e => !wallet.has_address(e[2], proposal.paths.length))
  const payments = proposal.payments
    .filter(e => !wallet.has_address(e[1], proposal.payments.length))
  const programs = proposal.programs
    .filter(e => !(e.length === 5 && e.includes(pub)))
  programs.forEach(e => {
    const idx = e.indexOf(pub)
    if (idx !== -1) e.splice(idx, 1)
  })

  const tmpl  = { ...proposal, paths, payments, programs }
  const mbrs  = rem_member_data(members, membership)
  
  return { ...session, members : mbrs, proposal : tmpl, signatures : [] }
}
