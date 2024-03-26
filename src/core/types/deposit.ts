import { Network }      from '@/types.js'
import { CovenantData } from './covenant.js'

import {
  SettleState,
  SpendState,
  TxOutput
} from './tx.js'

export type DepositData   = DepositInfo & DepositState & SettleState & SpendState
export type DepositState  = DepositConfirmed | DepositUnconfirmed
export type DepositStatus = 'reserved' | 'pending' | 'stale' | 'open' | 'locked' | 'spent' | 'settled' | 'expired' | 'error'

export type DepositDigest = DepositState & SettleState & SpendState & {
  covenant   : CovenantData | null
  status     : DepositStatus
  updated_at : number
}

export type FundDigest = DepositDigest & TxOutput

export interface LockRequest {
  dpid     : string
  covenant : CovenantData
}

export interface CloseRequest {
  dpid        : string
  feerate     : number
  return_psig : string
}

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

export interface DepositConfig {
  created_at ?: number
  dpid       ?: string
  utxo_state ?: DepositState
}

export interface DepositInfo {
  agent_tkn    : string
  covenant     : CovenantData | null
  created_at   : number
  deposit_pk   : string
  deposit_addr : string
  dpid         : string
  feerate      : number
  locktime     : number
  network      : Network
  return_addr  : string
  return_psig  : string
  status       : DepositStatus
  utxo         : TxOutput
  updated_at   : number
}
