import { ScriptData } from '@scrow/tapscript'

export type SpendState   = Spent | Unspent
export type SettleState  = Open  | Closed
export type ConfirmState = TxConfirmedState | TxUnconfirmedState

export interface TxConfirmedState {
  confirmed    : true
  block_hash   : string
  block_height : number
  block_time   : number
  expires_at   : number
}

export interface TxUnconfirmedState {
  confirmed    : false
  block_hash   : null
  block_height : null
  block_time   : null
  expires_at   : null
}

interface Closed {
  settled    : true
  settled_at : number
}

interface Open {
  settled    : false
  settled_at : null
}

interface Spent {
  spent       : true
  spent_at    : number
  spent_txhex : string
  spent_txid  : string
}

interface Unspent {
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
