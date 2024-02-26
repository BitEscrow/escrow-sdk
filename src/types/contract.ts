import { AgentSession } from './covenant.js'
import { MemberData }   from './draft.js'
import { StateData }    from './vm.js'

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

export type ContractData = AgentSession & ContractBase & SettleState & SpendState

export type ContractDigest = SettleState & SpendState & {
  activated  : number | null
  balance    : number
  est_txsize : number
  est_txfee  : number
  pending    : number
  status     : ContractStatus
  total      : number
  txin_count : number
  updated_at : number
  vm_state   : null | StateData
}

export type SpendTemplate = [
  label : string,
  txhex : string
]

export interface ContractConfig {
  agent_fee   : PaymentEntry
  cid        ?: string
  feerate     : number
  moderator  ?: string
  outputs    ?: SpendTemplate[]
  prop_id    ?: string
  published   : number
  session     : AgentSession
}

export interface ContractBase {
  activated   : null | number
  agent_fee   : PaymentEntry
  balance     : number
  cid         : string
  deadline    : number
  est_txfee   : number
  est_txsize  : number
  expires_at  : null | number
  feerate     : number
  members     : MemberData[]
  moderator   : string | null
  outputs     : SpendTemplate[]
  pending     : number
  pubkeys     : string[]
  prop_id     : string
  published   : number
  signatures  : string[]
  status      : ContractStatus
  subtotal    : number
  terms       : ProposalData
  total       : number
  txin_count  : number
  updated_at  : number
  vm_state    : null | StateData
  vout_size   : number
}
