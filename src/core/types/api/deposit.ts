import { ContractData } from '../contract.js'
import { AccountData }  from '../account.js'
import { DepositData }  from '../deposit.js'

export interface AccountDataResponse {
  account : AccountData
}

export interface DepositDataResponse {
  deposit : DepositData
}

export interface DepositListResponse {
  deposits : DepositData[]
}

export interface FundingDataResponse {
  contract : ContractData
  deposit  : DepositData
}
