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

export interface EventMessage <T = any> {
  body     : T
  envelope : SignedNote
  hash     : string
  subject  : string
}

export type EventFilter = {
  ids     ?: string[]
  authors ?: string[]
  kinds   ?: number[]
  since   ?: number
  until   ?: number
  limit   ?: number
} & { [ key : string ] : string[] | undefined }

export interface SocketConfig {
  connect_retries : number
  connect_timeout : number
  echo_timeout    : number
  receipt_timeout : number
  filter          : EventFilter
  kind            : number
  tags            : string[][]
  selfsub         : boolean
  debug           : boolean
  verbose         : boolean
}

export interface StoreConfig<T> extends SocketConfig {
  buffer_timer  : number
  refresh_ival  : number
  update_timer  : number
  parser       ?: (data : unknown) => Promise<T>
}

export interface SessionConfig {
  socket_config ?: Partial<SocketConfig>
  store_config  ?: Partial<StoreConfig<DraftData>>
  debug          : boolean
  verbose        : boolean
}

export interface Membership {
  data   : MemberData,
  signer : CredentialAPI,
  wallet : WalletAPI
}
