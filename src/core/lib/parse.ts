import {
  ContractData,
  PaymentEntry,
  DepositData,
  ProposalData,
  CovenantData,
  WitnessData
} from '../types/index.js'

import BaseSchema from '@/schema.js'
import CoreSchema from '@/core/schema/index.js'

export function parse_network (
  network : unknown
) {
  return BaseSchema.network.parse(network)
}

export function parse_payments (
  payments : unknown[]
) : PaymentEntry[] {
  return BaseSchema.payment.array().parse(payments)
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

export function parse_proposal (
  proposal : unknown
) : ProposalData {
  return CoreSchema.proposal.data.parse(proposal)
}

export function parse_witness (
  witness : unknown
) : WitnessData {
  return CoreSchema.program.witness.parse(witness)
}
