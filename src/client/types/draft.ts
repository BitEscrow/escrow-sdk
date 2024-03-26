import { ProgramTerms, ProposalData, ProposalTemplate } from '@/core/types/proposal.js'
import { CredentialAPI, WalletAPI } from './base.js'

export interface CredentialData {
  id   : string
  pub  : string
  pol ?: string
  sig  : string
  xpub : string
}

export interface Membership {
  data   : CredentialData
  signer : CredentialAPI
  wallet : WalletAPI
}

export interface RoleTemplate {
  title      : string
  id        ?: string
  min_slots ?: number
  max_slots ?: number
  paths     ?: [ string, number ][]
  payment   ?: number
  programs  ?: ProgramTerms[]
}

export interface RolePolicy {
  id        : string
  title     : string
  min_slots : number
  max_slots : number
  paths     : [ string, number ][]
  payment  ?: number
  programs  : ProgramTerms[]
}

export interface DraftTemplate {
  approvals  ?: string[]
  members    ?: CredentialData[]
  proposal    : ProposalTemplate | ProposalData
  roles      ?: Array<RolePolicy | RoleTemplate>
  signatures ?: string[]
  store      ?: DraftStore
  terms      ?: string[]
}

export interface DraftData {
  approvals  : string[]
  members    : CredentialData[]
  proposal   : ProposalData
  roles      : RolePolicy[]
  signatures : string[]
  store      : DraftStore
  terms      : string[]
}

export interface DraftStore {
  cid ?: string
}
