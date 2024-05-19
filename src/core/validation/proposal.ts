/* Module Imports */
import { create_program } from '../lib/vm.js'

import {
  get_pay_total,
  get_path_total,
  get_path_names
} from '../lib/proposal.js'

import { assert, now, parser } from '../util/index.js'

import {
  ProposalData,
  ProposalPolicy,
  ProposalTemplate,
  ScriptEngineAPI
} from '../types/index.js'

import PropSchema from '../schema/proposal.js'

/* Local Imports */

import { verify_program_entry } from './witness.js'

import {
  check_expires,
  check_regex
} from './util.js'

export function validate_proposal_tmpl (
  proposal : unknown
) : asserts proposal is ProposalTemplate {
  void PropSchema.template.parse(proposal)
}

export function validate_proposal_data (
  proposal : unknown
) : asserts proposal is ProposalData {
  parser.parse_proposal(proposal)
}

export function verify_proposal_data (
  machine  : ScriptEngineAPI,
  policy   : ProposalPolicy,
  proposal : ProposalData
) {
  // Check if feerate is valid.
  check_feerate(policy, proposal)
  // Check spending paths are valid.
  check_payments(proposal)
  // Check if timestamps are valid.
  check_stamps(policy, proposal)
  // Check if path-based program terms are valid.
  check_programs(machine, proposal)
  // Check if schedule tasks are valid.
  check_schedule(machine, proposal)
}

function check_feerate (
  policy   : ProposalPolicy,
  proposal : ProposalData
) {
  const { feerate } = proposal
  //
  if (feerate !== undefined) {
    //
    const { FEERATE_MIN, FEERATE_MAX } = policy
    // Assert that all terms are valid.
    assert.ok(feerate >= FEERATE_MIN, `feerate is below threshold: ${feerate} < ${FEERATE_MIN}`)
    assert.ok(feerate <= FEERATE_MAX, `feerate is above threshold: ${feerate} > ${FEERATE_MAX}`)
  }
}

function check_payments (proposal : ProposalData) {
  const { network, paths, payments, value } = proposal
  paths.forEach(e => { assert.is_valid_address(e[2], network) })
  payments.forEach(e  => { assert.is_valid_address(e[1], network) })

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
  machine  : ScriptEngineAPI,
  proposal : ProposalData
) {
  const { paths, programs } = proposal
  const path_names = get_path_names(paths)
  for (const terms of programs) {
    const prog = create_program(terms)
    const { actions, params, paths, method } = prog
    check_regex(machine.actions, actions)
    check_regex(path_names, paths)
    verify_program_entry(machine, method, params)
  }
}

function check_schedule (
  machine  : ScriptEngineAPI,
  proposal : ProposalData
) {
  const { duration, paths, schedule } = proposal
  const path_names = get_path_names(paths)
  schedule.forEach(task => {
    const [ timer, actions, paths ] = task
    check_expires(timer, duration)
    check_regex(machine.actions, actions)
    check_regex(path_names, paths)
  })
}

function check_stamps (
  policy   : ProposalPolicy,
  proposal : ProposalData
) {
  const { effective, duration } = proposal
  const current  = now()
  const deadline = proposal.deadline
  const terms    = policy

  if (duration < terms.DURATION_MIN) {
    throw new Error(`The specified contract duration is below the minimum allowed: ${duration} < ${terms.DURATION_MIN}`)
  }

  if (duration > terms.DURATION_MAX) {
    throw new Error(`The specified contract duration is above the maximum allowed: ${duration} > ${terms.DURATION_MAX}`)
  }

  if (deadline < terms.DEADLINE_MIN) {
    throw new Error(`The specified funding deadline is below the minimum allowed: ${deadline} < ${terms.DEADLINE_MIN}`)
  }

  if (deadline > terms.DEADLINE_MAX) {
    throw new Error(`The specified funding deadline is above the maximum allowed: ${deadline} > ${terms.DEADLINE_MAX}`)
  }

  if (typeof effective === 'number') {
    const EFFECT_MIN = current + deadline
    const EFFECT_MAX = current + terms.EFFECTIVE_MAX
    if (effective < EFFECT_MIN) {
      throw new Error(`The specified effective date does not leave enough time for the funding deadline: ${effective} < ${EFFECT_MIN}`)
    }
    if (effective > EFFECT_MAX) {
      throw new Error(`The specified effective date is too far into the future: ${effective} > ${EFFECT_MAX}`)
    }
  }
}

export default {
  validate : {
    template : validate_proposal_tmpl,
    data     : validate_proposal_data
  },
  verify : {
    data : verify_proposal_data
  }
}
