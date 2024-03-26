import { ContractData } from '../contract.js'
import { AccountData }  from '../account.js'

import {
  DepositData,
  DepositDigest
} from '../deposit.js'

export interface AccountDataResponse {
  account : AccountData
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
