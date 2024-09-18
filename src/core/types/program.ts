import { Literal } from '@/types/index.js'

export interface ProgramQuery {
  action   ?: string
  includes ?: Literal[]
  method   ?: string
  params   ?: Literal[]
  path     ?: string | null
}

export interface ProgramData {
  prog_id : string
  method  : string
  actions : string
  params  : Literal[]
  paths   : string | null
}
