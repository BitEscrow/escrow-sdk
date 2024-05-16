import { ContractData } from '../contract.js'
import { DepositData }  from '../deposit.js'

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
