import { ZodTypeAny }    from 'zod'
import { Bytes }         from '@cmdcode/buff'
import { AddressConfig } from '@cmdcode/signer'

import {
  Network,
  ProgramEntry,
  ProposalData,
  ProposalTemplate
} from '@/core/types/index.js'

export interface SignerConfig {
  network    : Network
  server_pk  : string
  server_url : string
}

export interface SignerOptions extends Partial<Omit<SignerConfig, 'network'>> {
  network ?: string | Network
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

export type PathTemplate = [
  path   : string,
  amount : number
]

export interface RoleTemplate {
  title      : string
  id        ?: string
  moderator ?: boolean
  paths     ?: PathTemplate[]
  payment   ?: number
  programs  ?: ProgramEntry[]
  seats     ?: number
}

export interface RolePolicy {
  id        : string
  title     : string
  moderator : boolean
  paths     : [ string, number ][]
  payment  ?: number
  programs  : ProgramEntry[]
  seats     : number
}

export interface CredentialConfig {
  hid ?: string
  idx ?: number
}

export interface CredentialData {
  pub  : string
  xpub : string
}

export interface MemberData extends CredentialData {
  pid : string
}

export interface DraftTemplate {
  proposal : ProposalTemplate
  roles    : RoleTemplate[]
}

export interface DraftSession {
  proposal : ProposalData
  members  : MemberData[]
  roles    : RolePolicy[]
  sigs     : string[]
}

export interface WalletAPI {
  xpub : string
  has_account : (extkey : string) => boolean
  get_account : (id : Bytes) => WalletAPI
  has_address : (addr : string, limit ?: number) => boolean
  get_address : (options ?: AddressConfig) => string
  new_address : (options ?: AddressConfig) => string
}
