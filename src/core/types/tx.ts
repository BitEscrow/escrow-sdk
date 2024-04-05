import { ScriptData } from '@scrow/tapscript'

export type SpendState  = Spent | Unspent
export type SettleState = Open  | Closed

interface Closed {
  settled    : true
  settled_at : number
}

interface Open {
  settled    : false
  settled_at : null
}

export interface Spent {
  spent       : true
  spent_at    : number
  spent_txhex : string
  spent_txid  : string
}

export interface Unspent {
  spent       : false
  spent_at    : null
  spent_txhex : null
  spent_txid  : null
}

export interface TxVout {
  value        : bigint
  scriptPubKey : ScriptData
}

export interface TxOutput {
  txid      : string
  vout      : number
  value     : number
  scriptkey : string
}
