import { Literal, ChainNetwork } from './base.js'

export type PaymentEntry = [
  value   : number,
  address : string
]

export type PathEntry = [
  path    : string,
  value   : number,
  address : string
]

export type ProgramEntry = [
  method    : string,
  actions   : string,
  paths     : string,
  ...params : Literal[]
]

export type ScheduleEntry = [
  stamp  : number,
  action : string,
  path   : string
]

export interface ProposalTemplate extends Omit<Partial<ProposalData>, 'network'> {
  duration : number
  network  : string
  title    : string
  value    : number
}

export interface ProposalData {
  content   ?: string
  created_at : number
  deadline   : number
  duration   : number
  effective ?: number
  engine     : string
  feerate   ?: number
  moderator ?: string
  network    : ChainNetwork
  paths      : PathEntry[]
  payments   : PaymentEntry[]
  programs   : ProgramEntry[]
  schedule   : ScheduleEntry[]
  title      : string
  txtimeout  : number
  value      : number
  version    : number
}

export interface ProposalPolicy {
  FEERATE_MIN   : number
  FEERATE_MAX   : number
  DEADLINE_MIN  : number
  DEADLINE_MAX  : number
  DURATION_MIN  : number
  DURATION_MAX  : number
  EFFECTIVE_MAX : number
  MULTISIG_MAX  : number
  TXTIMEOUT_MIN : number
  TXTIMEOUT_MAX : number
  VALID_ENGINES : string[]
}
