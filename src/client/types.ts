import { ZodTypeAny } from 'zod'

import {
  CredSignerAPI,
  MemberData,
  WalletAPI,
} from '@/types/index.js'

export interface ClientConfig {
  fetcher  ?: typeof fetch
  hostname ?: string
  oracle   ?: string
  network  ?: string
}

export interface SignerConfig extends ClientConfig {
  host_pub ?: string
  idxgen   ?: () => number
  signer    : CredSignerAPI
  wallet    : WalletAPI
}

export interface FetchConfig {
  url     : string, 
  init   ?: RequestInit | undefined
  schema ?: ZodTypeAny
  token  ?: string
}

export interface Membership {
  data   : MemberData,
  signer : CredSignerAPI,
  wallet : WalletAPI
}
