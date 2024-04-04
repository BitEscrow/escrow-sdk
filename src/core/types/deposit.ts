import { Network }      from './base.js'
import { CovenantData } from './covenant.js'
import { OracleTxRecvStatus } from './oracle.js'

import {
  SettleState,
  SpendState,
  TxOutput
} from './tx.js'

export type DepositData   = DepositInfo & DepositState & SettleState & SpendState
export type DepositState  = DepositConfirmed | DepositUnconfirmed
export type DepositStatus = 'reserved' | 'pending' | 'stale' | 'open' | 'locked' | 'spent' | 'settled' | 'expired' | 'error'

export type FundingData = DepositState & SettleState & SpendState & {
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
  created_at  ?: number
  utxo_status ?: OracleTxRecvStatus
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
  utxo         : TxOutput
  updated_at   : number
}
