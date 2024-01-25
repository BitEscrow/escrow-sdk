import { Buff }   from '@cmdcode/buff'
import { Wallet } from '@cmdcode/signer'

import {
  add_member_data,
  has_member_data,
  rem_member_data,
  update_member_data
} from './member.js'

import {
  compare_arr,
  find_program_idx
} from '../lib/util.js'

import {
  MemberData,
  ProgramTerms,
  ProposalData
} from '@/types/index.js'

import { RolePolicy } from '../types/index.js'

const GET_DEFAULT_POLICY = () => {
  return {
    limit    : 1,
    paths    : [],
    programs : []
  }
}

export function create_policy (
  policy : RolePolicy
) : RolePolicy {
  return { ...GET_DEFAULT_POLICY(), ...policy }
}

export function get_role_data (
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
    .map(e => e.slice(0, 3) as ProgramTerms)
  return { paths, payment, programs }
}

export function check_role_data (
  member   : MemberData,
  role     : RolePolicy,
  proposal : ProposalData
) {
  const { paths, payment, programs } = get_role_data(member, proposal)
  const pol = Buff.json(role).digest.hex

  if (member.pol !== pol) {
    throw new Error('policy hash does not match membership')
  }

  if (role.paths !== undefined && !compare_arr(paths, role.paths)) {
    throw new Error('enrolled paths do not match role template')
  }

  if (role.payment !== undefined && role.payment > 0 && payment !== role.payment) {
    throw new Error('enrolled payments do not match role template')
  }

  if (role.programs !== undefined && !compare_arr(programs, role.programs)) {
    throw new Error('enrolled programs do not match role template')
  }
}

export function is_member (
  mship    : MemberData,
  proposal : ProposalData
) {
  return proposal.members.some(e => {
    return e.pub === mship.pub && e.pol !== undefined
  })
}

export function add_membership (
  mship    : MemberData,
  role     : RolePolicy,
  proposal : ProposalData
) {
  const { pub, xpub } = mship
  const { network, paths, payments, programs } = proposal

  if (is_member(mship, proposal)) {
    throw new Error('previous role exists for membership')
  }

  const wallet = new Wallet(xpub)
  const pol    = Buff.json(role).digest.hex
  const rolls  = proposal.members.filter(e => e.pol === pol)
  const limit  = role.limit ?? 1
  
  if (rolls.length >= limit) {
    throw new Error('positions for this role have been filled')
  }

  if (role.paths !== undefined) {
    for (const [ label, amt ] of role.paths) {
      const addr = wallet.new_address({ network })
      paths.push([ label, amt, addr ])
    }
  }

  if (role.payment !== undefined && role.payment > 0) {
    const pay_addr = wallet.new_address({ network })
    payments.push([ role.payment, pay_addr ])
  }

  if (role.programs !== undefined) {
    for (const terms of role.programs) {
      const idx = find_program_idx(programs, terms)
      if (idx === null) {
        programs.push([ ...terms, pub ])
      } else {
        programs[idx].push(pub)
      }
    }
  }

  const mdata   = { ...mship, pol }
  const members = (has_member_data(proposal.members, mdata))
    ? update_member_data(proposal.members, mdata)
    : add_member_data(proposal.members, mdata)

  return { ...proposal, members, paths, payments, programs }
}

export function rem_membership (
  mship    : MemberData,
  proposal : ProposalData,
  leave = true
) : ProposalData {
  const { pub, xpub } = mship

  const wallet = new Wallet(xpub)

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

  const member  = { ...mship, pol : undefined }
  const members = (leave)
    ? rem_member_data(proposal.members, member)
    : update_member_data(proposal.members, member)

  return { ...proposal, members, paths, payments, programs }
}
