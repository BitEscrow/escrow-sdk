import { ZodTypeAny } from 'zod'

import {
  CredSignerAPI,
  ContractData,
  DepositAccount,
  DepositData,
  MemberData,
  WalletAPI,
  WitnessData
} from '@/types/index.js'

export interface ClientConfig {
  fetcher  ?: typeof fetch
  hostname ?: string
  oracle   ?: string
  network  ?: string
}

export interface SignerConfig extends ClientConfig {
  idxgen ?: () => number
  signer  : CredSignerAPI
  wallet  : WalletAPI
}

export interface FetchConfig {
  url     : string, 
  init   ?: RequestInit | undefined
  schema ?: ZodTypeAny
  token  ?: string
}

export interface Membership {
  signer : CredSignerAPI,
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
