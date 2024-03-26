import { Buff, Bytes } from '@cmdcode/buff'
import { ZodTypeAny }  from 'zod'
import { SignerAPI }   from '@/core/types/index.js'

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
  url     : string
  init   ?: RequestInit | undefined
  schema ?: ZodTypeAny
  token  ?: string
}

export interface DraftItem {
  pubkey     : string
  secret     : string
  store_id   : string
  topic_id   : string
  updated_at : number
}

export interface CredentialAPI extends SignerAPI {
  // TODO: Streamline this API into SignerAPI and make it async.
  backup    : (password : Bytes) => Bytes
  get_id    : (id : Bytes) => CredentialAPI
  gen_cred  : (idx : number, xpub : string) => CredentialData
  gen_token : (content : string) => string
  hmac      : (size : '256' | '512', ...bytes : Bytes[]) => Buff
}

export interface CredentialData {
  id   : string
  pub  : string
  sig  : string
  xpub : string
}

export interface WalletAPI {
  xpub : string
  has_account : (extkey : string) => boolean
  get_account : (id : Bytes) => WalletAPI
  has_address : (addr : string, limit ?: number) => boolean
  new_address : () => string
}
