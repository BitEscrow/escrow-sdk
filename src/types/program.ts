import { Literal }    from './base.js'
import { StoreEntry } from './vm.js'

export type ProgramMethod = 'sign'

export type ProgramData = (SignProgramData) & { prog_id : string }
export type WitnessData = SignWitnessData
export type ProgramList = Record<string, ProgramEval>

export type ProgramEval = (
  params: Literal[],
  store: StoreEntry
) => ProgramReturn

export type ProgramReturn = (
  witness : WitnessData
) => boolean | Promise<boolean>

export type WitnessEntry = [
  prog_id : string,
  method  : ProgramMethod,
  action  : string,
  path    : string,
  args    : Literal[]
]

export interface SignProgramData {
  actions : string
  method  : 'sign'
  paths   : string
  params  : [ number, ...string[] ]
}

export interface SignWitnessData {
  prog_id : string
  action  : string
  args    : string[]
  method  : 'sign'
  path    : string
}
