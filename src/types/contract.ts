import { AgentSession } from './session.js'
import { StateData }    from './vm.js'

import {
  Payment,
  ProposalData
} from './proposal.js'

import {
  SettleState,
  SpendState
} from './tx.js'

export type ContractStatus = 'published' | 'funded' | 'secured' | 'pending'  | 'active'  |
                             'closed'    | 'spent'  | 'settled' | 'canceled' | 'expired' | 'error'

export type ContractData   = AgentSession & ContractBase & SettleState & SpendState

export type SpendTemplate = [
  label : string,
  txhex : string
]

export interface ContractConfig {
  fees      : Payment[]
  moderator : string
  published : number
}

export interface ContractBase {
  activated   : null | number
  balance     : number
  cid         : string
  deadline    : number
  expires_at  : null | number
  fees        : Payment[]
  moderator   : string | null
  outputs     : SpendTemplate[]
  pending     : number
  prop_id     : string
  published   : number
  status      : ContractStatus
  terms       : ProposalData
  total       : number
  updated_at  : number
  vm_state    : null | StateData
}
