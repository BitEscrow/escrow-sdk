import { KeyContext } from '@cmdcode/musig2'

import {
  AgentSession,
  CovenantData
} from './covenant.js'

import {
  SettleState,
  SpendState,
  TxOutput
} from './tx.js'

import {
  ScriptWord,
  TapContext,
  TxData
} from '@scrow/tapscript'

export type DepositState  = DepositConfirmed | DepositUnconfirmed
export type DepositStatus = 'reserved' | 'pending' | 'stale' | 'open' | 'locked' | 'spent' | 'settled' | 'expired' | 'error'
export type DepositData   = AgentSession & DepositInfo & DepositState & SettleState & SpendState & TxOutput

interface DepositConfirmed {
  confirmed    : true
  block_hash   : string
  block_height : number
  block_time   : number
  expires_at   : number
}

interface DepositUnconfirmed {
  confirmed    : false
  block_hash   : null
  block_height : null
  block_time   : null
  expires_at   : null
}

export interface DepositContext {
  agent_pk  : string
  member_pk :  string
  key_data  : KeyContext
  script    : ScriptWord[]
  sequence  : number
  tap_data  : TapContext
}

export interface ReturnContext {
  pubkey    : string
  sequence  : number
  signature : string
  tapkey    : string
  tx        : TxData
}

export interface DepositAccount {
  created_at : number
  address    : string
  agent_id   : string
  agent_pk   : string
  member_pk  : string
  req_id     : string
  sequence   : number
  sig        : string
}

export interface DepositInfo {
  agent_id   : string
  agent_pk   : string
  agent_pn   : string
  covenant   : CovenantData | null
  created_at : number
  dpid       : string
  member_pk  : string
  return_tx  : string
  sequence   : number
  status     : DepositStatus
  updated_at : number
}

export interface ReturnData {
  dpid   : string,
  pnonce : string,
  psig   : string,
  txhex  : string
}

export interface DepositRequest {
  pubkey   : string,
  locktime : number
}

export interface DepositRegister {
  agent_id  : string
  covenant ?: CovenantData
  return_tx : string
}
