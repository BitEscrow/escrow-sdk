import { ZodTypeAny }    from 'zod'
import { Bytes }         from '@cmdcode/buff'
import { AddressConfig } from '@cmdcode/signer'

import {
  Network,
  ProgramEntry,
  ProposalData,
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

export interface RoleTemplate {
  title      : string
  id        ?: string
  min_num   ?: number
  max_num   ?: number
  paths     ?: [ string, number ][]
  payment   ?: number
  programs  ?: ProgramEntry[]
}

export interface RolePolicy {
  id        : string
  title     : string
  min_num   : number
  max_num   : number
  paths     : [ string, number ][]
  payment  ?: number
  programs  : ProgramEntry[]
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
  pid  : string
  sig ?: string
}

export interface DraftSession {
  proposal : ProposalData
  members  : MemberData[]
  roles    : RolePolicy[]
  terms    : string[]
}

export interface WalletAPI {
  xpub : string
  has_account : (extkey : string) => boolean
  get_account : (id : Bytes) => WalletAPI
  has_address : (addr : string, limit ?: number) => boolean
  new_address : (options ?: AddressConfig) => string
}
