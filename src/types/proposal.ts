import { Literal, Network } from './base.js'
import { MemberData }       from './member.js'

export type PaymentEntry = [
  value   : number,
  address : string
]

export type PathEntry = [
  path    : string,
  value   : number,
  address : string
]

export type ProgramTerms = [
  method    : string,
  actions   : string,
  paths     : string,
  ...params : Literal[]
]

export type ScheduleTerms = [
  stamp  : number,
  action : string,
  path   : string
]

export interface ProposalTemplate extends Omit <
 Partial<ProposalData>, 'network'
> {
  title   : string,
  expires : number,
  network : string,
  value   : number
}

export interface ProposalData {
  content   ?: string
  deadline  ?: number
  effective ?: number
  expires    : number
  feerate   ?: number
  members    : MemberData[]
  moderator ?: string
  network    : Network
  paths      : PathEntry[]
  payments   : PaymentEntry[]
  programs   : ProgramTerms[]
  schedule   : ScheduleTerms[]
  title      : string
  value      : number
  version    : number
}
