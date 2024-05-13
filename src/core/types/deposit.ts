import { Network }      from './base.js'
import { CovenantData } from './covenant.js'
import { ProofEntry }   from './signer.js'

import {
  TxConfirmState,
  TxSettleState,
  TxSpendState,
  TxOutput
} from './tx.js'

export type LockState     = DepositIsLocked | DepositIsUnlocked
export type CloseState    = DepositIsClosed | DepositIsOpen
export type DepositData   = DepositInfo & TxConfirmState & LockState & CloseState & TxSettleState & TxSpendState
export type DepositStatus = 'registered' | 'confirmed' | 'closed' | 'locked' | 'spent' | 'settled' | 'expired' | 'error'

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

export interface DepositIsClosed {
  closed      : true
  closed_at   : number
  return_txid : string
}

export interface DepositIsOpen {
  closed      : false
  closed_at   : null
  return_txid : null
}

export interface DepositConfig {
  created_at ?: number
  utxo_state ?: TxConfirmState
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
  server_tkn   : string
  sigs         : ProofEntry<DepositStatus>[]
  status       : DepositStatus
  updated_at   : number
  utxo         : TxOutput
}
