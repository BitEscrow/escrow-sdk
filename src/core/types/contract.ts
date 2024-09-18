import { FundingData } from './deposit.js'
import { WitnessData } from './witness.js'

import { ScriptEngineAPI, MachineData } from './machine.js'

import {
  PaymentEntry,
  ProposalData
} from './proposal.js'

import { TxSpendState } from './tx.js'

export type ContractStatus =
  'published' |  // Contract is published and awaiting funds.
  'canceled'  |  // Published contract is canceled and funds are released.
  'secured'   |  // Contract funds are confirmed and awaiting activation.
  'active'    |  // Contract is active and CVM is running.
  'closed'    |  // Contract is closed and awaiting settlement.
  'spent'     |  // Contract is settled and awaiting confirmation.
  'settled'   |  // Contract is settled and confirmed on-chain.
  'error'        // Something went wrong, may require manual intervention.

export type ContractPublishState = ContractIsPublished | ContractIsCanceled
export type ContractFundingState = ContractIsSecured   | ContractIsPending
export type ContractActiveState  = ContractIsActive    | ContractIsInactive
export type ContractExecState    = ContractIsOpen      | ContractIsClosed
export type ContractSettleState  = ContractIsSettled   | ContractNotSettled

export type ContractData =
  ContractBase         &
  ContractPublishState &
  ContractFundingState &
  ContractActiveState  &
  ContractExecState    &
  TxSpendState         &
  ContractSettleState

export type ContractSignatures = 'created_sig' | 'canceled_sig' | 'secured_sig' | 'active_sig' |
                                 'closed_sig'  | 'spent_sig'    | 'settled_sig'

export type ContractPreImage = Omit<ContractData, ContractSignatures>

export type SpendTemplate = [
  label : string,
  txhex : string
]

interface ContractIsPublished {
  canceled     : false
  canceled_at  : null
  canceled_sig : null
}

interface ContractIsCanceled {
  canceled     : true
  canceled_at  : number
  canceled_sig : string
}

interface ContractIsSecured {
  secured      : true
  secured_sig  : string
  effective_at : number
}

interface ContractIsPending {
  secured      : false
  secured_sig  : null
  effective_at : null
}

interface ContractIsActive {
  activated    : true
  active_at    : number
  active_sig   : string
  machine_head : string
  machine_vmid : string
  expires_at   : number
}

interface ContractIsInactive {
  activated    : false
  active_at    : null
  active_sig   : null
  machine_head : null
  machine_vmid : null
  expires_at   : null
}

interface ContractIsClosed {
  closed       : true
  closed_at    : number
  closed_sig   : string
  machine_vout : string | null
}

interface ContractIsOpen {
  closed       : false
  closed_at    : null
  closed_sig   : null
  machine_vout : null
}

export interface ContractIsSettled {
  settled      : true
  settled_at   : number
  settled_sig  : string
  spent_block  : string | null
  spent_height : number | null
}

export interface ContractNotSettled {
  settled      : false
  settled_at   : null
  settled_sig  : null
  spent_block  : null
  spent_height : null
}

export interface PublishRequest {
  endorsements ?: string[]
  proposal      : ProposalData
}

export interface ContractCreateConfig {
  created_at ?: number
  fees        : PaymentEntry[]
  feerate     : number
}

export interface ContractBase {
  agent_pk     : string
  cid          : string
  created_at   : number
  created_sig  : string
  deadline_at  : number
  endorsements : string[]
  fees         : PaymentEntry[]
  feerate      : number
  funds_pend   : number
  funds_conf   : number
  moderator    : string | null
  outputs      : SpendTemplate[]
  prop_id      : string
  status       : ContractStatus
  subtotal     : number
  terms        : ProposalData
  tx_bsize     : number
  tx_fees      : number
  tx_vsize     : number
  tx_total     : number
  vin_count    : number
  vin_txfee    : number
  updated_at   : number
}

export interface ContractSession {
  contract    : ContractData
  engine     ?: ScriptEngineAPI
  funds      ?: FundingData[]
  statements ?: WitnessData[]
  vmdata     ?: MachineData
}
