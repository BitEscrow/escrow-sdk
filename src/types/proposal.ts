import { Literal, Network } from './base.js'

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

export interface ProposalTemplate extends Omit<Partial<ProposalData>, 'network'> {
  duration : number,
  network ?: string,
  title    : string,
  value    : number
}

export interface ProposalData {
  content   ?: string
  deadline  ?: number
  duration   : number
  effective ?: number
  feerate   ?: number
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
