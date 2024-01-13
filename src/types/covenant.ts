import { Bytes }        from '@cmdcode/buff'
import { MusigContext } from '@cmdcode/musig2'

export type MutexEntry = [
  label : string,
  ctx   : MutexContext
]

export interface AgentSession {
  agent_id : string
  agent_pk : string
  agent_pn : string
}

export interface CovenantData {
  cid    : string
  pnonce : string
  psigs  : [ string, string ][]
}

export interface CovenantStatus {
  confirmed : boolean
  txid      : string
  value     : number
}

export interface MutexContext {
  sid   : Bytes
  mutex : MusigContext
  tweak : Bytes
}
