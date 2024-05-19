import { ContractData } from '@/core/types/contract.js'
import { DepositData }  from '@/core/types/deposit.js'

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
