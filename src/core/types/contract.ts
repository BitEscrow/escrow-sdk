import {
  PaymentEntry,
  ProposalData
} from './proposal.js'

import {
  SettleState,
  SpendState
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
export type ContractActiveState  = ContractIsActive    | ContractIsInactive
export type ContractCloseState   = ContractIsOpen      | ContractIsClosed

export type ContractData =
  ContractBase         &
  ContractPublishState &
  ContractActiveState  &
  ContractCloseState   &
  SpendState           &
  SettleState

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

interface ContractIsActive {
  activated  : true
  active_at  : number
  expires_at : number
  vmid       : string
}

interface ContractIsInactive {
  activated  : false
  active_at  : null
  expires_at : null
  vmid       : null
}

interface ContractIsClosed {
  closed      : true
  closed_at   : number
  closed_hash : string
  closed_path : string
}

interface ContractIsOpen {
  closed      : false
  closed_at   : null
  closed_hash : null
  closed_path : null
}

export interface ContractRequest {
  proposal    : ProposalData
  signatures ?: string[]
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
  effective_at : number | null
  fees         : PaymentEntry[]
  feerate      : number
  fund_count   : number
  fund_pend    : number
  fund_txfee   : number
  fund_value   : number
  moderator    : string | null
  outputs      : SpendTemplate[]
  prop_id      : string
  server_pk    : string
  server_sig   : string
  signatures   : string[]
  status       : ContractStatus
  subtotal     : number
  terms        : ProposalData
  tx_fees      : number
  tx_total     : number
  tx_bsize     : number
  tx_vsize     : number
  updated_at   : number
}
