import * as assert       from '@/assert.js'
import { DefaultPolicy } from '@/config/index.js'
import { ServerPolicy }  from '@/types.js'
import { now }           from '@/util.js'

import { parse_proposal } from '../lib/parse.js'
import { create_program } from '../lib/witness.js'
import { verify_program } from './witness.js'

import {
  get_pay_total,
  get_path_total,
  get_path_names
} from '../lib/proposal.js'

import {
  check_expires,
  check_regex
} from './util.js'

import {
  ProgramEntry,
  ProposalData,
  ProposalTemplate
} from '../types/index.js'

import PropSchema from '../schema/proposal.js'

export function validate_program (
  program : unknown
) : asserts program is ProgramEntry {
  PropSchema.program.parse(program)
}

export function validate_prop_template (
  proposal : unknown
) : asserts proposal is ProposalTemplate {
  void PropSchema.template.parse(proposal)
}

export function validate_proposal (
  proposal : unknown
) : asserts proposal is ProposalData {
  parse_proposal(proposal)
}

export function verify_proposal (
  proposal : ProposalData,
  policy   : ServerPolicy = DefaultPolicy
) {
  // Check spending paths are valid.
  check_payments(proposal)
  // Check if timestamps are valid.
  check_stamps(policy, proposal)
  // Check if path-based program terms are valid.
  check_programs(policy, proposal)
  // Check if schedule tasks are valid.
  check_schedule(policy, proposal)
}

function check_payments (proposal : ProposalData) {
  const { network, paths, payments, value } = proposal
  paths.forEach(e => { assert.valid_address(e[2], network) })
  payments.forEach(e  => { assert.valid_address(e[1], network) })

  // Get totals for fees and paths.
  const total_fees  = get_pay_total(payments)
  const total_paths = get_path_total(paths)

  if (total_fees > value) {
    throw new Error(`Total fees should not exceed contract value: ${total_fees} > ${value}`)
  }

  for (const [ name, amt ] of total_paths) {
    if (amt + total_fees !== value) {
      const tally = `${amt} + ${total_fees} !== ${value}`
      throw new Error(`Path "${name}" plus fees does not equal contract value: ${tally}`)
    }
  }
}

function check_programs (
  policy   : ServerPolicy,
  proposal : ProposalData
) {
  const { VALID_ACTIONS, VALID_METHODS } = policy.proposal
  const { paths, programs } = proposal
  const path_names = get_path_names(paths)
  for (const terms of programs) {
    const prog = create_program(terms)
    const { actions, params, paths, method } = prog
    check_regex(VALID_ACTIONS, actions)
    check_regex(path_names, paths)
    verify_program(method, params, VALID_METHODS)
  }
}

function check_schedule (
  policy   : ServerPolicy,
  proposal : ProposalData
) {
  const { VALID_ACTIONS } = policy.proposal
  const { duration, paths, schedule } = proposal
  const path_names = get_path_names(paths)
  schedule.forEach(task => {
    const [ timer, actions, paths ] = task
    check_expires(timer, duration)
    check_regex(VALID_ACTIONS, actions)
    check_regex(path_names, paths)
  })
}

function check_stamps (
  policy   : ServerPolicy,
  proposal : ProposalData
) {
  const { effective, duration } = proposal
  const pol      = policy.proposal
  const current  = now()
  const deadline = proposal.deadline ?? pol.DEADLINE_DEF

  if (duration < pol.DURATION_MIN) {
    throw new Error(`The specified contract duration is below the minimum allowed: ${duration} < ${pol.DURATION_MIN}`)
  }

  if (duration > pol.DURATION_MAX) {
    throw new Error(`The specified contract duration is above the maximum allowed: ${duration} > ${pol.DURATION_MAX}`)
  }

  if (deadline < pol.DEADLINE_MIN) {
    throw new Error(`The specified funding deadline is below the minimum allowed: ${deadline} < ${pol.DEADLINE_MIN}`)
  }

  if (deadline > pol.DEADLINE_MAX) {
    throw new Error(`The specified funding deadline is above the maximum allowed: ${deadline} > ${pol.DEADLINE_MAX}`)
  }

  if (typeof effective === 'number') {
    const EFFECT_MIN = current + (deadline ?? pol.DEADLINE_DEF)
    const EFFECT_MAX = current + pol.EFFECTIVE_MAX
    if (effective < EFFECT_MIN) {
      throw new Error(`The specified effective date does not leave enough time for the funding deadline: ${effective} < ${EFFECT_MIN}`)
    }
    if (effective > EFFECT_MAX) {
      throw new Error(`The specified effective date is too far into the future: ${effective} > ${EFFECT_MAX}`)
    }
  }
}
