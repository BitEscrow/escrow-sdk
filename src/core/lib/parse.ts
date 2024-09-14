import {
  ContractData,
  PaymentEntry,
  DepositData,
  ProposalData,
  CovenantData,
  WitnessData,
  ProgramData,
  FundingData,
  ProposalPolicy,
  AccountPolicy
} from '@/types/index.js'

import BaseSchema from '@/schema/base.js'
import CoreSchema from '../schema/index.js'

export function parse_network (
  network : unknown
) {
  return BaseSchema.network.parse(network)
}

export function parse_payments (
  payments : unknown[]
) : PaymentEntry[] {
  return CoreSchema.proposal.payment.array().parse(payments)
}

export function parse_contract (
  contract : unknown
) : ContractData {
  return CoreSchema.contract.data.parse(contract)
}

export function parse_covenant (
  covenant : unknown
) : CovenantData {
  return CoreSchema.account.covenant.parse(covenant as CovenantData)
}

export function parse_deposit (
  deposit : unknown
) : DepositData {
  return CoreSchema.deposit.data.parse(deposit)
}

export function parse_fund (
  deposit : unknown
) : FundingData {
  return CoreSchema.deposit.fund.parse(deposit)
}

export function parse_program (
  program : unknown
) : ProgramData {
  return CoreSchema.machine.program.parse(program)
}

export function parse_proposal (
  proposal : unknown
) : ProposalData {
  return CoreSchema.proposal.data.parse(proposal)
}

export function parse_account_policy (
  policy : unknown
) : AccountPolicy {
  return CoreSchema.account.policy.parse(policy)
}

export function parse_proposal_policy (
  policy : unknown
) : ProposalPolicy {
  return CoreSchema.proposal.policy.parse(policy)
}

export function parse_witness_data (
  witness : unknown
) : WitnessData {
  return CoreSchema.witness.data.parse(witness)
}

export function parse_witness_receipt (
  witness : unknown
) : WitnessData {
  return CoreSchema.witness.receipt.parse(witness)
}
