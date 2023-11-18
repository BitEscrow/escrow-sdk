import { Buff } from '@cmdcode/buff'

import {
  ContractData,
  Payment,
  DepositData,
  ProposalData,
  WitnessData,
  ProgramData,
} from '../types/index.js'

import * as schema from '../schema/index.js'

export function parse_payments (
  payments : Payment[]
) : Payment[] {
  return schema.base.payment.array().parse(payments)
}

export function parse_contract (
  contract : unknown
) : ContractData {
  return schema.contract.data.parse(contract)
}

export function parse_deposit (
  deposit : unknown
) : DepositData {
  return schema.deposit.data.parse(deposit)
}

export function parse_program (
  terms : unknown[]
) : ProgramData {
  const [ method, actions, paths, ...params ] = terms
  const parser  = schema.program.terms
  const parsed  = parser.parse({ method, actions, paths, params })
  const img     = [ method, ...params ]
  const prog_id = Buff.json(img).digest.hex
  return { prog_id, ...parsed }
}

export function parse_proposal (
  proposal : unknown
) : ProposalData {
  return schema.proposal.data.parse(proposal)
}

export function parse_witness (
  witness : unknown[]
) : WitnessData {
  const [ prog_id, method, action, path, ...args ] = witness
  const parser  = schema.program.witness
  return parser.parse({ prog_id, method, action, path, args })
}
