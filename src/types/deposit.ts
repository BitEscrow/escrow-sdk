import { KeyContext } from '@cmdcode/musig2'

import {
  AgentSession,
  CovenantData
} from './session.js'

import {
  SettleState,
  SpendState
} from './tx.js'

import {
  Network,
  ScriptWord,
  TapContext,
  TxData
} from '@scrow/tapscript'

export type DepositState  = Confirmed | Unconfirmed
export type DepositStatus = 'reserved' | 'pending' | 'stale' | 'open' | 'locked' | 'spent' | 'settled' | 'expired' | 'error'
export type DepositData   = AgentSession & DepositBase & DepositState & SpendOut & SettleState & SpendState

interface Confirmed {
  confirmed    : true
  block_hash   : string
  block_height : number
  block_time   : number
  expires_at   : number
}

interface Unconfirmed {
  confirmed    : false
  block_hash   : null
  block_height : null
  block_time   : null
  expires_at   : null
}

export interface DepositContext {
  agent_key   : string
  deposit_key : string
  key_data    : KeyContext
  script      : ScriptWord[]
  sequence    : number
  tap_data    : TapContext
}

export interface DepositTemplate {
  agent_id  : string
  covenant ?: CovenantData
  return_tx : string
}

export interface DepositBase {
  created_at  : number
  covenant    : CovenantData | null
  deposit_id  : string
  deposit_key : string
  return_tx   : string
  sequence    : number
  status      : DepositStatus
  updated_at  : number
}

export interface DepositConfig {
  address ?: string
  cid     ?: string
  network ?: Network
  pubkey  ?: string
  reckey  ?: string
  txfee   ?: number
}

export interface DepositInfo {
  address   : string,
  agent_id  : string,
  agent_key : string,
  sequence  : number
}

export interface ReturnContext {
  pubkey    : string
  sequence  : number
  signature : string
  tapkey    : string
  tx        : TxData
}

export interface SpendOut {
  txid      : string,
  vout      : number,
  value     : number,
  scriptkey : string
}
