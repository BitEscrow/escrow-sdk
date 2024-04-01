import { Wallet }                from '@cmdcode/signer'
import { assert, get_object_id } from '@/core/util/index.js'
import { ProposalData }          from '@/core/types/index.js'
import { get_program_idx }       from '@/core/lib/vm.js'

import {
  MemberEntry,
  RolePolicy,
  RoleTemplate,
  DraftSession
} from '../types.js'

import { parse_credential } from './credential.js'

const GET_ROLE_DEFAULTS = () => {
  return {
    min_slots : 1,
    max_slots : 1,
    paths     : [],
    programs  : []
  }
}

export function create_role_policy (
  template : RoleTemplate
) : RolePolicy {
  const pol = { ...GET_ROLE_DEFAULTS(), ...template }
  const id  = get_object_id(pol).hex
  return { ...pol, id }
}

export function has_role_policy (
  pol_id  : string,
  session : DraftSession
) {
  const policy = session.roles.find(e => e.id === pol_id)
  assert.ok(policy !== undefined, 'role does not exists for policy id: ' + pol_id)
}

export function get_role_policy (
  pol_id  : string,
  session : DraftSession
) {
  const policy = session.roles.find(e => e.id === pol_id)
  assert.ok(policy !== undefined, 'role policy not found for id: ' + pol_id)
  return policy
}

export function add_member_data (
  mship    : string,
  policy   : RolePolicy,
  proposal : ProposalData
) : ProposalData {
  const { network, paths, payments, programs } = proposal
  const { pub, xpub } = parse_credential(mship)

  const wallet = new Wallet(xpub)

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
      const idx = get_program_idx(programs, terms)
      if (idx === null) {
        programs.push([ ...terms, pub ])
      } else {
        programs[idx].push(pub)
      }
    }
  }

  return { ...proposal, paths, payments, programs }
}

export function rem_member_data (
  mship    : string,
  proposal : ProposalData
) : ProposalData {
  const { pub, xpub } = parse_credential(mship)
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

  return { ...proposal, paths, payments, programs }
}

export function get_enrollment (
  mship    : string,
  proposal : ProposalData
) {
  const { pub, xpub } = parse_credential(mship)
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

export function tabulate_slots (
  members : MemberEntry[],
  roles   : RolePolicy[]
) {
  const slots = new Map(roles.map(e => [ e.id, 0 ]))
  for (const pol of roles) {
    const tab = slots.get(pol.id)
    assert.exists(tab)
    for (const [ _, pol_id ] of members) {
      if (pol_id === pol.id) {
        slots.set(pol.id, tab + 1)
      }
    }
  }
  return slots
}

export function has_open_slots (
  pol_id  : string,
  session : DraftSession
) {
  const { members, roles } = session
  const policy = roles.find(e => e.id === pol_id)
  assert.ok(policy !== undefined, 'role does not exists for policy id: ' + pol_id)
  const slots = members.filter(e => e[1] === pol_id)
  return slots.length < policy.max_slots
}

export function has_full_slots (
  members : MemberEntry[],
  roles   : RolePolicy[]
) {
  const tab = tabulate_slots(members, roles)
  return roles.every(e => {
    const { id, min_slots, max_slots } = e
    const count = tab.get(id)
    return (
      count !== undefined &&
      count >= min_slots  &&
      count <= max_slots
    )
  })
}
