import { Network }            from './base.js'
import { CovenantData }       from './covenant.js'

import {
  ConfirmState,
  SettleState,
  SpendState,
  TxOutput
} from './tx.js'

export type LockState     = DepositIsLocked | DepositIsUnlocked
export type DepositData   = DepositInfo & ConfirmState & LockState & SettleState & SpendState
export type DepositStatus = 'pending' | 'open' | 'locked' | 'spent' | 'settled' | 'expired' | 'error'

export type FundingData = ConfirmState & SettleState & SpendState & {
  covenant   : CovenantData | null
  status     : DepositStatus
  updated_at : number
  utxo       : TxOutput
}

export interface LockRequest {
  dpid     : string
  covenant : CovenantData
}

export interface DepositIsLocked {
  covenant  : CovenantData
  locked    : true
  locked_at : number
}

export interface DepositIsUnlocked {
  covenant  : null
  locked    : false
  locked_at : null
}

export interface CloseRequest {
  dpid        : string
  feerate     : number
  return_psig : string
}

export interface DepositConfig {
  created_at ?: number
  utxo_state ?: ConfirmState
}

export interface DepositInfo {
  acct_hash    : string
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
  satpoint     : string
  server_pk    : string
  server_sig   : string
  server_tkn   : string
  status       : DepositStatus
  updated_at   : number
  utxo         : TxOutput
}
