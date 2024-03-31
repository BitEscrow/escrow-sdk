import { ScriptWord } from '@scrow/tapscript'
import { Network }    from './base.js'

export interface RecoveryConfig {
  agent_pk    : string
  deposit_pk  : string
  locktime    : number
  network     : Network
  return_addr : string
}

export interface RecoveryContext {
  cblock     : string
  extension ?: string
  pubkey     : string
  sequence   : number
  script     : ScriptWord[]
}
