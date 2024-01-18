import { Literal }    from './base.js'
import { StoreEntry } from './vm.js'

export type ProgramMethod  = 'oracle' | 'hlock' | 'endorse'
export type MethodManifest = Record<ProgramMethod, ProgramExec>

export type ProgramExec = (
  params : Literal[],
  store  : StoreEntry
) => ProgramReturn

export type ProgramReturn = (
  witness : WitnessData
) => boolean | Promise<boolean>

export interface ProgramQuery {
  action   ?: string
  includes ?: Literal[]
  method   ?: string
  params   ?: Literal[]
  path     ?: string
}

export interface ProgramData {
  prog_id : string
  method  : string
  actions : string
  params  : Literal[]
  paths   : string
}

export interface WitnessTemplate {
  action : string
  args  ?: Literal[]
  method : string
  path   : string
  stamp ?: number
}

export interface WitnessPreimage {
  action  : string
  args    : Literal[]
  method  : string
  path    : string
  prog_id : string
  stamp   : number
}

export interface WitnessData extends WitnessPreimage {
  sigs : string[]
  wid  : string
}
