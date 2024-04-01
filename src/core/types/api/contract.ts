import { FundingData }  from '../deposit.js'
import { ContractData } from '../contract.js'

export interface FundListResponse {
  funds : FundingData[]
}

export interface ContractDataResponse {
  contract : ContractData
}

export interface ContractListResponse {
  contracts : ContractData[]
}
