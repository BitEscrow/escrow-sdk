import { Bytes }          from '@cmdcode/buff'
import { MusigContext }   from '@cmdcode/musig2'
import { AccountContext } from './account.js'
import { TxOutput }       from './tx.js'

export type SessionEntry = [
  label   : string,
  session : CovenantSession
]

export interface SessionToken {
  id  : string
  pk  : string
  pn  : string
  tkn : string
  ts  : number
}

export interface CovenantSession {
  acct  : AccountContext
  cvid  : Bytes
  musig : MusigContext
  tweak : Bytes
  utxo  : TxOutput
}

export interface CovenantData {
  cid      : string
  cvid     : string
  pnonce   : string
  psigs    : [ string, string ][]
}

export interface CovenantStatus {
  confirmed : boolean
  txid      : string
  value     : number
}
