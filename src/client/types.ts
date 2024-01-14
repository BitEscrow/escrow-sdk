import { ZodTypeAny } from 'zod'

import {
  ContractData,
  DepositData,
  DepositInfo,
  MemberData,
  SignerAPI,
  WalletAPI,
  WitnessData
} from '@/types/index.js'

export type FundingData  = { contract : ContractData, deposit : DepositData }

export type ContractDataResponse = DataResponse<ContractData>
export type ContractListResponse = DataResponse<ContractData[]>
export type DepositInfoResponse  = DataResponse<DepositInfo>
export type DepositDataResponse  = DataResponse<DepositData>
export type DepositListResponse  = DataResponse<DepositData[]>
export type FundingDataResponse  = DataResponse<FundingData>
export type WitnessDataResponse  = DataResponse<WitnessData>
export type WitnessListResponse  = DataResponse<WitnessData[]>

export interface ClientConfig {
  fetcher  ?: typeof fetch
  hostname ?: string
  oracle   ?: string
}

export interface SignerConfig {
  idxgen ?: () => number
  signer  : SignerAPI
  wallet  : WalletAPI
}

export interface DataResponse<T> {
  data : T
}

export interface FetchConfig {
  url     : string, 
  init   ?: RequestInit | undefined
  schema ?: ZodTypeAny
  token  ?: string
}

export interface Membership {
  signer : SignerAPI,
  token  : MemberData,
  wallet : WalletAPI
}
