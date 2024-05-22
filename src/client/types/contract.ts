import {
  ContractData,
  FundingData
} from '@/core/types/index.js'

export interface ContractDataResponse {
  contract : ContractData
}

export interface ContractListResponse {
  contracts : ContractData[]
}

export interface FundListResponse {
  funds : FundingData[]
}
