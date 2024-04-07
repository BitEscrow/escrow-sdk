import { ContractData } from '../contract.js'
import { FundingData }  from '../deposit.js'

export interface ContractDataResponse {
  contract : ContractData
}

export interface ContractListResponse {
  contracts : ContractData[]
}

export interface FundListResponse {
  contract : ContractData
  funds    : FundingData[]
}
