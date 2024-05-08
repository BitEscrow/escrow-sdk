import { ScriptData } from '@scrow/tapscript'

export type SpendState   = TxSpentState   | TxUnspentState
export type SettleState  = TxSettledState | TxUnsettledState
export type ConfirmState = TxIsConfirmed  | TxIsUnconfirmed

export interface TxIsConfirmed {
  confirmed    : true
  block_hash   : string
  block_height : number
  block_time   : number
  expires_at   : number
}

export interface TxIsUnconfirmed {
  confirmed    : false
  block_hash   : null
  block_height : null
  block_time   : null
  expires_at   : null
}

export interface TxSettledState {
  settled    : true
  settled_at : number
}

export interface TxUnsettledState {
  settled    : false
  settled_at : null
}

export interface TxSpentState {
  spent       : true
  spent_at    : number
  spent_txhex : string
  spent_txid  : string
}

export interface TxUnspentState {
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
