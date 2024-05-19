import { Network }      from './base.js'
import { CovenantData } from './covenant.js'

import {
  TxConfirmState,
  TxSettleState,
  TxSpendState,
  TxOutput
} from './tx.js'

export type LockState     = DepositIsLocked | DepositIsUnlocked
export type CloseState    = DepositIsClosed | DepositIsOpen
export type DepositData   = DepositBase & TxConfirmState & LockState & CloseState & TxSettleState & TxSpendState
export type DepositStatus = 'registered' | 'confirmed' | 'closed' | 'locked' | 'spent' | 'settled' | 'expired' | 'error'

export type DepositSignatures = 'created_sig' | 'locked_sig' | 'closed_sig' | 'spent_sig' | 'settled_sig'
export type DepositPreImage   = Omit<DepositData, DepositSignatures>

export type FundingData = TxConfirmState & TxSettleState & TxSpendState & {
  covenant   : CovenantData | null
  status     : DepositStatus
  updated_at : number
  utxo       : TxOutput
}

export interface LockRequest {
  dpid     : string
  covenant : CovenantData
}

export interface CloseRequest {
  dpid        : string
  return_rate : number
  return_psig : string
}

export interface DepositIsLocked {
  covenant   : CovenantData
  locked     : true
  locked_at  : number
  locked_sig : string
}

export interface DepositIsUnlocked {
  covenant   : null
  locked     : false
  locked_at  : null
  locked_sig : null
}

export interface DepositIsClosed {
  closed       : true
  closed_at    : number
  closed_sig   : string
  return_txid  : string
  return_txhex : string
}

export interface DepositIsOpen {
  closed       : false
  closed_at    : null
  closed_sig   : null
  return_txid  : null
  return_txhex : null
}

export interface DepositConfig {
  created_at ?: number
  utxo_state ?: TxConfirmState
}

export interface DepositBase {
  account_hash : string
  created_at   : number
  created_sig  : string
  deposit_pk   : string
  deposit_addr : string
  dpid         : string
  locktime     : number
  network      : Network
  return_addr  : string
  return_rate  : number
  return_psig  : string
  satpoint     : string
  agent_pk    : string
  agent_tkn   : string
  status       : DepositStatus
  updated_at   : number
  utxo         : TxOutput
}
