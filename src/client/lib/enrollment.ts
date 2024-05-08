import { Wallet }                from '@cmdcode/signer'
import { assert, get_object_id } from '@/core/util/index.js'
import { ProposalData }          from '@/core/types/index.js'
import { get_program_idx }       from '@/core/lib/vm.js'

import {
  MemberData,
  RolePolicy,
  RoleTemplate,
  DraftSession,
  CredentialData
} from '../types.js'

const GET_ROLE_DEFAULTS = () => {
  return {
    moderator : false,
    paths     : [],
    programs  : [],
    seats     : 1
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

export function get_role_paths_totals (
  roles : Array<RoleTemplate | RolePolicy>
) {
  const path_totals = new Map<string, number>()

  for (const { paths } of roles) {
    if (paths !== undefined) {
      paths.forEach(([ label, value ]) => {
        const curr = path_totals.get(label) ?? 0
        path_totals.set(label, curr + value)
      })
    }
  }

  return [ ...path_totals ]
}

export function get_role_payment_totals (
  roles : Array<RoleTemplate | RolePolicy>
) {
  let bal = 0
  for (const role of roles) {
    bal += role.payment ?? 0
  }
  return bal
}

export function add_member_data (
  cred     : CredentialData,
  policy   : RolePolicy,
  proposal : ProposalData
) : ProposalData {
  const { network, paths, payments, programs } = proposal
  const { pub, xpub } = cred

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
  cred     : CredentialData,
  proposal : ProposalData
) : ProposalData {
  const { pub, xpub } = cred
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
  cred     : CredentialData,
  proposal : ProposalData
) {
  const { pub, xpub } = cred
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

export function verify_member_data (
  cred     : CredentialData,
  proposal : ProposalData,
  role     : RolePolicy
) {
  const { paths, payment, programs } = role
  const rdata  = get_enrollment(cred, proposal)
  const rpaths = rdata.paths.map(e => e.toString())
  const rprogs = programs.map(e => e.toString())
  if (
    typeof payment === 'number' &&
    payment > 0                 &&
    payment < rdata.payment
  ) {
    throw new Error(`payment in "${role.title}" policy insufficient for member: ${cred.pub}`)
  }
  paths.forEach(e => {
    if (!rpaths.includes(e.toString())) {
      throw new Error(`"${e[0]}" path in "${role.title}" policy missing for member: ${cred.pub}`)
    }
  })
  programs.forEach(tmpl => {
    const exists = rprogs.find(e => e.startsWith(tmpl.toString()))
    if (exists === undefined) {
      throw new Error(`"${tmpl[0]}" method in "${role.title}" policy missing for member: ${cred.pub}`)
    }
  })
}

export function tabulate_slots (
  members : MemberData[],
  roles   : RolePolicy[]
) {
  const slots = new Map(roles.map(e => [ e.id, 0 ]))
  for (const pol of roles) {
    const tab = slots.get(pol.id)
    assert.exists(tab)
    for (const { pid } of members) {
      if (pid === pol.id) {
        slots.set(pol.id, tab + 1)
      }
    }
  }
  return slots
}

export function has_open_roles (
  policy_id : string,
  session   : DraftSession
) {
  const { members, roles } = session
  const policy = roles.find(e => e.id === policy_id)
  assert.ok(policy !== undefined, 'role does not exists for policy id: ' + policy_id)
  const slots = members.filter(e => e.pid === policy_id)
  return slots.length < policy.seats
}

export function has_full_roles (
  members : MemberData[],
  roles   : RolePolicy[]
) {
  const tab = tabulate_slots(members, roles)
  return roles.every(e => {
    const { id, seats } = e
    const count = tab.get(id)
    return (count !== undefined && count === seats)
  })
}
