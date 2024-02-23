import { ProgramTerms, ProposalData, ProposalTemplate } from './proposal.js'

export interface MemberData {
  id   : string
  pub  : string
  pol ?: string
  sig  : string
  xpub : string
}

export interface RoleTemplate {
  title      : string
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
  members    ?: MemberData[],
  proposal    : ProposalTemplate | ProposalData
  roles      ?: RolePolicy[]
  signatures ?: string[]
  terms      ?: string[]
}

export interface DraftData {
  members    : MemberData[]
  proposal   : ProposalData
  roles      : RolePolicy[]
  signatures : string[]
  terms      : string[]
}
