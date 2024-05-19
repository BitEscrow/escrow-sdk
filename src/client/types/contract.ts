import {
  ContractData,
  FundingData,
  VMData
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

export interface ContractVerifyConfig {
  contract : ContractData
  funds   ?: FundingData[]
  pubkey   : string
  vmdata  ?: VMData
}
