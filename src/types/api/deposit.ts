import { ContractData } from '../contract.js'
import { CovenantData } from '../covenant.js'
import { TxOutput }     from '../tx.js'

import {
  DepositAccount,
  DepositData,
  DepositDigest,
} from '../deposit.js'

export interface AccountRequest {
  deposit_pk : string
  locktime  ?: number
  spend_xpub : string
}

export interface RegisterRequest {
  deposit_pk  : string
  sequence    : number
  spend_xpub  : string
  utxo        : TxOutput
}

export interface CommitRequest extends RegisterRequest {
  covenant : CovenantData
}

export interface LockRequest {
  covenant : CovenantData
}

export interface CloseRequest {
  pnonce : string
  psig   : string
  txfee  : number
}

export interface AccountDataResponse {
  account : DepositAccount
}

export interface DepositDataResponse {
  deposit : DepositData
}

export interface DepositListResponse {
  deposits : DepositData[]
}

export interface DepositDigestResponse {
  deposit : DepositDigest
}

export type DepositStatusResponse = {
  deposit : DepositDigest
  updated : true
} | {
  deposit : undefined
  updated : false
}

export interface FundingDataResponse {
  contract : ContractData
  deposit  : DepositData
}
