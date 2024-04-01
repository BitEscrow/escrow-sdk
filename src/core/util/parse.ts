import {
  ContractData,
  PaymentEntry,
  DepositData,
  ProposalData,
  CovenantData,
  WitnessData,
  ProgramData,
  FundingData
} from '../types/index.js'

import CoreSchema from '../schema/index.js'

export function parse_network (
  network : unknown
) {
  return CoreSchema.base.network.parse(network)
}

export function parse_payments (
  payments : unknown[]
) : PaymentEntry[] {
  return CoreSchema.base.payment.array().parse(payments)
}

export function parse_contract (
  contract : unknown
) : ContractData {
  return CoreSchema.contract.data.parse(contract)
}

export function parse_covenant (
  covenant : unknown
) : CovenantData {
  return CoreSchema.covenant.data.parse(covenant as CovenantData)
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
  return CoreSchema.vm.program.parse(program)
}

export function parse_proposal (
  proposal : unknown
) : ProposalData {
  return CoreSchema.proposal.data.parse(proposal)
}

export function parse_witness (
  witness : unknown
) : WitnessData {
  return CoreSchema.witness.data.parse(witness)
}
