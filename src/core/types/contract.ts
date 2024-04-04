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
  'pending'   |  // Contract is in the process of being activated.
  'active'    |  // Contract is active and CVM is running.
  'closed'    |  // Contract is closed and awaiting settlement.
  'spent'     |  // Contract is settled and awaiting confirmation.
  'settled'   |  // Contract is settled and confirmed on-chain.
  'canceled'  |  // Published contract is canceled and funds are released.
  'expired'   |  // Active contract has expired and funds are released.
  'error'        // Something went wrong, may require manual intervention.

export type ActiveState  = ContractIsActive | ContractIsInactive
export type ContractData = ContractBase & ActiveState & SettleState & SpendState

export type SpendTemplate = [
  label : string,
  txhex : string
]

interface ContractIsActive {
  activated  : true
  active_at  : number
  active_vm  : string
  expires_at : number
}

interface ContractIsInactive {
  activated  : false
  active_at  : null
  active_vm  : null
  expires_at : null
}

export interface ContractRequest {
  proposal    : ProposalData
  signatures ?: string[]
}

export interface ContractConfig {
  cid        ?: string
  created_at ?: number
  fees        : PaymentEntry[]
  feerate     : number
  outputs    ?: SpendTemplate[]
  prop_id    ?: string
}

export interface ContractBase {
  cid         : string
  created_at  : number
  deadline    : number
  fees        : PaymentEntry[]
  feerate     : number
  fund_count  : number
  fund_pend   : number
  fund_txfee  : number
  fund_value  : number
  moderator   : string | null
  outputs     : SpendTemplate[]
  prop_id     : string
  server_pk   : string
  server_sig  : string
  signatures  : string[]
  status      : ContractStatus
  subtotal    : number
  terms       : ProposalData
  tx_fees     : number
  tx_total    : number
  tx_bsize    : number
  tx_vsize    : number
  updated_at  : number
}
