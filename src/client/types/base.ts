import { ZodTypeAny }    from 'zod'
import { Bytes }         from '@cmdcode/buff'
import { AddressConfig } from '@cmdcode/signer'

import {
  ChainNetwork,
  SignerAPI
} from '@/core/types/index.js'

export interface SignerConfig {
  network    : ChainNetwork
  server_pk  : string
  server_url : string
}

export interface SignerOptions extends Partial<Omit<SignerConfig, 'network'>> {
  network ?: string | ChainNetwork
  xpub    ?: string
}

export interface ClientConfig extends SignerConfig {
  oracle_url : string
}

export interface ClientOptions extends SignerOptions {
  fetcher    ?: typeof fetch
  oracle_url ?: string
}

export interface FetchConfig {
  url     : string
  init   ?: RequestInit | undefined
  schema ?: ZodTypeAny
  token  ?: string
}

export interface ClientSignerAPI extends SignerAPI {
  xpub      : string
  backup    : (password : Bytes) => Bytes
  gen_token : (content : string) => string
}

export interface WalletAPI {
  xpub : string
  has_account : (extkey : string) => boolean
  get_account : (id : Bytes) => WalletAPI
  has_address : (addr : string, limit ?: number) => boolean
  get_address : (options ?: AddressConfig) => string
  new_address : (options ?: AddressConfig) => string
}
