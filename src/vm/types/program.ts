import {
  Literal,
  WitnessData
} from '@/core/types/index.js'

import { VMStoreEntry } from './vm.js'

export type ExecProgram = (
  params : Literal[],
  store  : VMStoreEntry
) => ProgramReturn

export type ProgramReturn = (
  witness : WitnessData
) => boolean | Promise<boolean>

export type VerifyProgram = (
  params : Literal[]
) => string | null

export interface ProgramMethodAPI {
  exec   : ExecProgram
  verify : VerifyProgram
}
