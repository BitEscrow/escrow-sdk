import { ZodTypeAny } from 'zod'

import {
  CredentialAPI,
  DraftData,
  MemberData,
  SignedNote,
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

export interface EventMessage {
  body     : any
  envelope : SignedNote
  subject  : string
}

export interface SocketConfig {
  connect_retries : number
  connect_timeout : number
  receipt_timeout : number
  filter  : Record<string, any>
  kind    : number
  tags    : string[][]
  selfsub : boolean
  silent  : boolean
  verbose : boolean
}

export interface StoreConfig<T> extends SocketConfig {
  buffer_timer  : number
  commit_timer  : number
  refresh_ival  : number
  store_parser  : (store : unknown) => Promise<T | null>
  store_timeout : number
}

export interface SessionConfig {
  socket_config ?: Partial<SocketConfig>
  store_config  ?: Partial<StoreConfig<DraftData>>
}

export interface Membership {
  data   : MemberData,
  signer : CredentialAPI,
  wallet : WalletAPI
}
