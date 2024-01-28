import { AgentSession } from './covenant.js'
import { StateData }    from './vm.js'

import {
  PaymentEntry,
  ProposalData
} from './proposal.js'

import {
  SettleState,
  SpendState
} from './tx.js'

export type ContractStatus = 'published' | 'funded' | 'secured' | 'pending'  | 'active'  |
                             'closed'    | 'spent'  | 'settled' | 'canceled' | 'expired' | 'error'

export type ContractData = AgentSession & ContractBase & SettleState & SpendState

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
  updated_at  : number
  vm_state    : null | StateData
  vout_size   : number
}

export type ContractRequest = {
  proposal    : ProposalData
  signatures ?: string[]
}
