import { Wallet }          from '@cmdcode/signer'
import { get_object_id }   from '@/util.js'
import { ProposalData }    from '@/core/types/index.js'
import { get_program_idx } from '@/core/lib/witness.js'

import {
  RolePolicy,
  RoleTemplate
} from '../types.js'

const GET_ROLE_DEFAULTS = () => {
  return {
    min_slots : 1,
    max_slots : 1,
    paths     : [],
    programs  : []
  }
}

export function create_role (
  template : RoleTemplate
) : RolePolicy {
  const pol = { ...GET_ROLE_DEFAULTS(), ...template }
  const id  = get_object_id(pol).hex
  return { ...pol, id }
}

// export function tabulate_roles (
//   members : string[],
//   roles   : RolePolicy[]
// ) {
//   const scores = new Map(roles.map(e => [ e.id, 0 ]))
//   for (const pol of roles) {
//     const tab = scores.get(pol.id)
//     assert.exists(tab)
//     for (const mbr of members) {
//       if (mbr.pol === pol.id) {
//         scores.set(pol.id, tab + 1)
//       }
//     }
//   }
//   return scores
// }

// export function has_full_enrollment (
//   members : MemberData[],
//   roles   : RolePolicy[]
// ) {
//   const scores = tabulate_enrollment(members, roles)
//   return roles.every(e => {
//     const { id, min_slots, max_slots } = e
//     const score = scores.get(id)
//     return (
//       score !== undefined &&
//       score >= min_slots  &&
//       score <= max_slots
//     )
//   })
// }

// export function is_enrolled (
//   members  : MemberData[],
//   mship    : MemberData
// ) {
//   return members.some(e => {
//     return e.pub === mship.pub && e.pol !== undefined
//   })
// }

// export function add_enrollment (
//   membership : MemberData,
//   policy     : RolePolicy,
//   session    : DraftData
// ) {
//   let roles = session.roles,
//       sdata = session

//   if (!has_policy(policy.id, roles)) {
//     roles = [ ...session.roles, policy ]
//     sdata = { ...session, roles }
//   }

//   return join_role(membership, policy, sdata)
// }

export function add_member (
  policy   : RolePolicy,
  proposal : ProposalData,
  pubkey   : string,
  xpub     : string
) : ProposalData {
  const { network, paths, payments, programs } = proposal

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
        programs.push([ ...terms, pubkey ])
      } else {
        programs[idx].push(pubkey)
      }
    }
  }

  return { ...proposal, paths, payments, programs }
}

export function rem_member (
  proposal : ProposalData,
  pubkey   : string,
  xpub     : string
) : ProposalData {
  const wallet   = new Wallet(xpub)

  const paths    = proposal.paths
    .filter(e => !wallet.has_address(e[2], proposal.paths.length))
  const payments = proposal.payments
    .filter(e => !wallet.has_address(e[1], proposal.payments.length))
  const programs = proposal.programs
    .filter(e => !(e.length === 5 && e.includes(pubkey)))
  programs.forEach(e => {
    const idx = e.indexOf(pubkey)
    if (idx !== -1) e.splice(idx, 1)
  })

  return { ...proposal, paths, payments, programs }
}

export function get_enrollment (
  proposal : ProposalData,
  pubkey   : string,
  xpub     : string
) {
  const wallet = new Wallet(xpub)
  const paths  = proposal.paths
    .filter(e => wallet.has_address(e[2]), proposal.paths.length)
    .map(e => [ e[0], e[1] ] as [ string, number ])
  const payment = proposal.payments
    .filter(e => wallet.has_address(e[1]), proposal.payments.length)
    .reduce((p, n) => p + n[0], 0)
  const programs = proposal.programs
    .filter(e => e.includes(pubkey))
  return { paths, payment, programs }
}
