import { ZodTypeAny } from 'zod'
import { Bytes }      from '@cmdcode/buff'

import {
  Network,
  ProgramEntry,
  ServerPolicy,
  VirtualMachineAPI
} from '@/core/types/index.js'

export interface SignerConfig {
  machine    : VirtualMachineAPI
  network    : Network
  server_pol : ServerPolicy
  server_pk  : string
  server_url : string
}

export interface SignerOptions extends Partial<SignerConfig> {
  xpub ?: string
}

export interface ClientConfig extends SignerConfig {
  oracle_url : string
}

export interface ClientOptions extends Partial<ClientConfig> {
  fetcher ?: typeof fetch
}

export interface FetchConfig {
  url     : string
  init   ?: RequestInit | undefined
  schema ?: ZodTypeAny
  token  ?: string
}

export interface RoleTemplate {
  title      : string
  id        ?: string
  min_slots ?: number
  max_slots ?: number
  paths     ?: [ string, number ][]
  payment   ?: number
  programs  ?: ProgramEntry[]
}

export interface RolePolicy {
  id        : string
  title     : string
  min_slots : number
  max_slots : number
  paths     : [ string, number ][]
  payment  ?: number
  programs  : ProgramEntry[]
}

// export interface CredentialAPI extends SignerAPI {
//   // TODO: Streamline this API into SignerAPI and make it async.
//   backup    : (password : Bytes) => Bytes
//   get_id    : (id : Bytes) => CredentialAPI
//   gen_cred  : (idx : number, xpub : string) => CredentialData
//   gen_token : (content : string) => string
//   hmac      : (size : '256' | '512', ...bytes : Bytes[]) => Buff
// }

// export interface CredentialData {
//   id   : string
//   pub  : string
//   sig  : string
//   xpub : string
// }

export interface WalletAPI {
  xpub : string
  has_account : (extkey : string) => boolean
  get_account : (id : Bytes) => WalletAPI
  has_address : (addr : string, limit ?: number) => boolean
  new_address : () => string
}
