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

export type AccountStatus = 'init' | 'reserved' | 'funded' | 'registered'
export type DepositState  = DepositConfirmed | DepositUnconfirmed
export type DepositStatus = 'reserved' | 'pending' | 'stale' | 'open' | 'locked' | 'spent' | 'settled' | 'expired' | 'error'
export type DepositData   = AgentSession & DepositInfo & DepositState & SettleState & SpendState & TxOutput

// export type FundData = DepositState & SettleState & SpendState & TxOutput & {
//   sequence   : number
//   status     : DepositStatus
//   updated_at : number
// }

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
  agent_pk   : string
  deposit_pk : string
  key_data   : KeyContext
  return_pk  : string
  script     : ScriptWord[]
  sequence   : number
  tap_data   : TapContext
}

export interface ReturnContext {
  pubkey    : string
  sequence  : number
  signature : string
  tapkey    : string
  tx        : TxData
}

export interface DepositAccount {
  acct_id    : string
  acct_sig   : string
  address    : string
  agent_id   : string
  agent_pk   : string
  created_at : number
  deposit_pk : string
  sequence   : number
  spend_xpub : string
}

export interface DepositInfo {
  covenant    : CovenantData | null
  created_at  : number
  deposit_pk  : string
  dpid        : string
  return_psig : string | null
  sequence    : number
  spend_xpub  : string
  status      : DepositStatus
  updated_at  : number
}

export interface DepositDigest {
  block_height : number | null
  confirmed    : boolean
  expires_at   : number | null
  settled      : boolean
  spent        : boolean
  spent_txid   : string | null
  status       : DepositStatus
  updated_at   : number
  txid         : string
  value        : number
  vout         : number
}

export interface ReturnData {
  dpid   : string
  pnonce : string
  psig   : string
  txhex  : string
}

export interface ExtendedKey {
  prefix : number
  depth  : number
  fprint : number
  index  : number
  code   : string
  type   : number
  key    : string
  seckey : string
  pubkey : string
}
