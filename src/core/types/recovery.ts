import { ScriptWord }   from '@scrow/tapscript'
import { ChainNetwork } from '@/types/index.js'

export interface RecoveryConfig {
  agent_pk    : string
  deposit_pk  : string
  locktime    : number
  network     : ChainNetwork
  return_addr : string
}

export interface RecoveryContext {
  cblock     : string
  extension ?: string
  pubkey     : string
  sequence   : number
  script     : ScriptWord[]
}
