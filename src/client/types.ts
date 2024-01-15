import { ZodTypeAny } from 'zod'

import {
  ContractData,
  DepositData,
  MemberData,
  SignerAPI,
  WalletAPI,
} from '@/types/index.js'

export type FundingData  = { contract : ContractData, deposit : DepositData }

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
