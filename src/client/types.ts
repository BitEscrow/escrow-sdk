import { ZodTypeAny } from 'zod'

import {
  CredentialAPI,
  DraftData,
  MemberData,
  SignedEvent,
  WalletAPI,
} from '@/types/index.js'

import { NostrSocket } from './index.js'

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
  envelope : SignedEvent
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
} & { [ key : string ] : any | undefined }

export interface DraftItem {
  pubkey     : string,
  session_id : string,
  store_id   : string,
  updated_at : number
}

export interface SocketConfig {
  connect_retries : number
  connect_timeout : number
  echo_timeout    : number
  receipt_timeout : number
  send_delta      : number
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
  socket       ?: NostrSocket
}

export interface SubscribeConfig {
  envelope ?: Partial<SignedEvent>
  filter    : Record<string, any>
  selfsub  ?: boolean
  sub_id    : string
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
