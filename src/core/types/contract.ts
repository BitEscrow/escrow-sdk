import { ProofEntry } from './signer.js'

import {
  PaymentEntry,
  ProposalData
} from './proposal.js'

import {
  TxSettleState,
  TxSpendState
} from './tx.js'

export type ContractStatus =
  'published' |  // Contract is published and awaiting funds.
  'funded'    |  // Contract is funded and awaiting confirmation.
  'secured'   |  // Contract funds are confirmed and awaiting activation.
  'active'    |  // Contract is active and CVM is running.
  'closed'    |  // Contract is closed and awaiting settlement.
  'spent'     |  // Contract is settled and awaiting confirmation.
  'settled'   |  // Contract is settled and confirmed on-chain.
  'canceled'  |  // Published contract is canceled and funds are released.
  'expired'   |  // Active contract has expired and funds are released.
  'error'        // Something went wrong, may require manual intervention.

export type ContractPublishState = ContractIsPublished | ContractIsCanceled
export type ContractFundingState = ContractIsSecured   | ContractIsPending
export type ContractActiveState  = ContractIsActive    | ContractIsInactive
export type ContractExecState    = ContractIsOpen      | ContractIsClosed

export type ContractData =
  ContractBase         &
  ContractPublishState &
  ContractFundingState &
  ContractActiveState  &
  ContractExecState    &
  TxSpendState         &
  TxSettleState

export type SpendTemplate = [
  label : string,
  txhex : string
]

interface ContractIsPublished {
  canceled    : false
  canceled_at : null
}

interface ContractIsCanceled {
  canceled    : true
  canceled_at : number
}

interface ContractIsSecured {
  secured      : true
  effective_at : number
  tx_fees      : number
  tx_vsize     : number
  tx_total     : number
}

interface ContractIsPending {
  secured      : false
  effective_at : null
  tx_fees      : null
  tx_vsize     : null
  tx_total     : null
}

interface ContractIsActive {
  activated   : true
  active_at   : number
  engine_head : string
  engine_vmid : string
  expires_at  : number
}

interface ContractIsInactive {
  activated   : false
  active_at   : null
  engine_head : null
  engine_vmid : null
  expires_at  : null
}

interface ContractIsClosed {
  closed      : true
  closed_at   : number
  engine_vout : string | null
}

interface ContractIsOpen {
  closed      : false
  closed_at   : null
  engine_vout : null
}

export interface ContractRequest {
  endorsements ?: string[]
  proposal      : ProposalData
}

export interface ContractCreateConfig {
  created_at ?: number
  fees        : PaymentEntry[]
  feerate     : number
}

export interface ContractBase {
  cid          : string
  created_at   : number
  deadline_at  : number
  endorsements : string[]
  fees         : PaymentEntry[]
  feerate      : number
  funds_pend   : number
  funds_conf   : number
  moderator    : string | null
  outputs      : SpendTemplate[]
  prop_id      : string
  server_pk    : string
  sigs         : ProofEntry<ContractStatus>[]
  status       : ContractStatus
  subtotal     : number
  terms        : ProposalData
  tx_bsize     : number
  vin_count    : number
  vin_txfee    : number
  updated_at   : number
}
