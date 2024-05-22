import {
  ProgramEntry,
  ProposalData,
  ProposalTemplate
} from '@/core/types/index.js'

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
