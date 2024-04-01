import { ZodTypeAny } from 'zod'
import { Bytes }      from '@cmdcode/buff'

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

export type MemberEntry = [
  mship  : string,
  pol_id : string,
  sig   ?: string
]

export interface MemberData {
  hid  : string
  pub  : string
  xpub : string
}

export interface DraftSession {
  proposal : ProposalData
  members  : MemberEntry[]
  roles    : RolePolicy[]
}

export interface WalletAPI {
  xpub : string
  has_account : (extkey : string) => boolean
  get_account : (id : Bytes) => WalletAPI
  has_address : (addr : string, limit ?: number) => boolean
  new_address : () => string
}
