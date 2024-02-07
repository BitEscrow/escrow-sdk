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

export interface ContractDigest {
  activated  : number | null
  balance    : number
  est_txsize : number
  est_txfee  : number
  pending    : number
  settled    : boolean
  spent      : boolean
  spent_txid : string | null
  status     : ContractStatus
  total      : number
  txin_count : number
  updated_at : number
}
