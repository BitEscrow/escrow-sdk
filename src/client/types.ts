import { ZodTypeAny } from 'zod'

import {
  ContractData,
  DepositAccount,
  DepositData,
  MemberData,
  SignerAPI,
  WalletAPI,
  WitnessData,
} from '@/types/index.js'

export interface ClientConfig {
  fetcher  ?: typeof fetch
  hostname ?: string
  oracle   ?: string
}

export interface SignerConfig extends ClientConfig {
  idxgen ?: () => number
  signer  : SignerAPI
  wallet  : WalletAPI
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

export interface AccountDataResponse {
  account : DepositAccount
}

export interface ContractDataResponse {
  contract : ContractData
}

export interface ContractListResponse {
  contracts : ContractData[]
}

export interface DepositDataResponse {
  deposit : DepositData
}

export interface DepositListResponse {
  deposits : DepositData[]
}

export interface WitnessDataResponse {
  witness : WitnessData
}

export interface WitnessListResponse {
  witnesses : WitnessData[]
}

export interface FundingDataResponse {
  contract : ContractData
  deposit  : DepositData
}
