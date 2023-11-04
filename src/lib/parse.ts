import { Buff } from '@cmdcode/buff'

import {
  ContractData,
  Payment,
  DepositData,
  ProposalData,
  ProgramTerms,
  ProgramData,
  WitnessData
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
  terms : ProgramTerms
) : ProgramData {
  const [ actions, paths, method, ...params ] = terms
  const img = [ method, ...params ]
  const id  = Buff.json(img).digest.hex
  return { id, actions, paths, method, params }
}

export function parse_proposal (
  proposal : unknown
) : ProposalData {
  return schema.proposal.data.parse(proposal)
}

export function parse_witness (
  witness : unknown
) : WitnessData {
  return schema.vm.witness.parse(witness)
}