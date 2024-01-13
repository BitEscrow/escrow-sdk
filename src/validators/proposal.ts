import { parse_program, parse_proposal } from '../lib/parse.js'
import { now }            from '../lib/util.js'

import {
  MIN_DEADLINE,
  MIN_EXPIRY,
  MAX_EXPIRY,
  MIN_WINDOW,
  MAX_EFFECT,
  VALID_ACTIONS
} from '../config.js'

import {
  get_pay_total,
  get_path_total,
  get_path_names
} from '../lib/proposal.js'

import {
  check_expires,
  check_regex,
  check_valid_action
} from './util.js'

import { ProposalData } from '../types/index.js'

import * as assert from '../assert.js'
import { check_program_config } from './program.js'

export function validate_proposal (
  proposal : unknown
) : asserts proposal is ProposalData {
  parse_proposal(proposal)
}

export function verify_proposal (
  proposal : ProposalData
) {
  // Check spending paths are valid.
  check_payments(proposal)
  // Check if timestamps are valid.
  check_stamps(proposal)
  // Check if path-based program terms are valid.
  check_programs(proposal)
  // Check if schedule tasks are valid.
  check_schedule(proposal)
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

/**
 * CHECK MEMBERSHIPS
 * - check signatures on memberships
 * - validate member roles (need policy array)
 * 
 */

function check_programs (
  proposal : ProposalData
) {
  const { paths, programs } = proposal
  const path_names = get_path_names(paths)
  for (const terms of programs) {
    const prog = parse_program(terms)
    const { actions, params, paths, method } = prog
    check_regex(VALID_ACTIONS, actions)
    check_regex(path_names, paths)
    check_program_config(method, params)
  }
}

function check_schedule (proposal : ProposalData) {
  const { expires, paths, schedule } = proposal
  const names = get_path_names(paths)
  schedule.forEach(task => {
    const [ timer, action, regex ] = task
    check_expires(timer, expires)
    check_valid_action(action)
    check_regex(names, regex)
  })
}

function check_stamps (proposal : ProposalData) {
  const { deadline = MIN_DEADLINE, effective, expires } = proposal
  const current = now()

  if (expires < MIN_EXPIRY) {
    throw new Error(`The specified expiration window is below the minimum allowed: ${expires} < ${MIN_EXPIRY}`)
  }

  if (expires > MAX_EXPIRY) {
    throw new Error(`The specified expiration window is above the maximum allowed: ${expires} > ${MAX_EXPIRY}`)
  }

  if (deadline < MIN_DEADLINE) {
    throw new Error(`The specified deadline is below the minimum allowed: ${deadline} < ${MIN_DEADLINE}`)
  }

  if (deadline > (expires - MIN_WINDOW)) {
    throw new Error(`The delta between deadline and expiration does not meet the minimum execution window.`)
  }

  if (typeof effective === 'number') {
    const MIN_EFFECT = current + MIN_WINDOW
    const MIN_DLINE  = current + deadline
    const MAX_DATE   = current + MAX_EFFECT
    if (effective < MIN_EFFECT) {
      throw new Error(`The effective date does not currently meet the minimum execution window.`)
    }
    if (effective < MIN_DLINE) {
      throw new Error(`The effective date does not currently leave enough time for the deadline.`)
    }
    if (effective > MAX_DATE) {
      throw new Error(`The effective date is too far into the future: ${effective} > ${MAX_DATE}`)
    }
  }
}
