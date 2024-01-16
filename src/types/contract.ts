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
  agent       : AgentSession
  cid         : string
  fees       ?: PaymentEntry[]
  moderator  ?: string
  proposal    : ProposalData
  published  ?: number
  signatures ?: string[]
}

export interface ContractBase {
  activated   : null | number
  balance     : number
  cid         : string
  deadline    : number
  expires_at  : null | number
  fees        : PaymentEntry[]
  moderator   : string | null
  outputs     : SpendTemplate[]
  pending     : number
  pubkeys     : string[]
  prop_id     : string
  published   : number
  signatures  : string[]
  status      : ContractStatus
  terms       : ProposalData
  total       : number
  updated_at  : number
  vm_state    : null | StateData
}

export type ContractRequest = {
  proposal    : ProposalData
  signatures ?: string[]
}
