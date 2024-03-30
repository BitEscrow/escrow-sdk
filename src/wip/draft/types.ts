import { ProgramTerms, ProposalData, ProposalTemplate } from '@/core/types/proposal.js'
import { CredentialAPI, WalletAPI } from '../client/types.js'

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
