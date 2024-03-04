import { ZodTypeAny } from 'zod'

import {
  CredentialAPI,
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
  host_pubkey ?: string
  idxgen      ?: () => number
  signer       : CredentialAPI
  wallet       : WalletAPI
}

export interface FetchConfig {
  url     : string, 
  init   ?: RequestInit | undefined
  schema ?: ZodTypeAny
  token  ?: string
}

export interface DraftItem {
  pubkey     : string,
  secret     : string,
  store_id   : string,
  topic_id   : string,
  updated_at : number
}

export interface Membership {
  data   : MemberData,
  signer : CredentialAPI,
  wallet : WalletAPI
}
