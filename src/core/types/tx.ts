import { ScriptData } from '@scrow/tapscript'

export type TxSpendState   = TxIsSpent     | TxIsUnspent
export type TxSettleState  = TxIsSettled   | TxNotSettled
export type TxConfirmState = TxIsConfirmed | TxIsUnconfirmed

export interface OracleTxStatus {
  confirmed     : boolean
  block_hash   ?: string
  block_height ?: number
  block_time   ?: number
}

export interface TxIsConfirmed {
  confirmed    : true
  confirmed_at : number
  conf_block   : string
  conf_height  : number
  expires_at   : number
}

export interface TxIsUnconfirmed {
  confirmed    : false
  confirmed_at : number
  conf_block   : string
  conf_height  : number
  expires_at   : null
}

export interface TxIsSettled {
  settled      : true
  settled_at   : number
  settled_sig  : string
  spent_block  : string
  spent_height : number
}

export interface TxNotSettled {
  settled      : false
  settled_at   : null
  settled_sig  : null
  spent_block  : null
  spent_height : null
}

export interface TxIsSpent {
  spent       : true
  spent_at    : number
  spent_sig   : string
  spent_txhex : string
  spent_txid  : string
}

export interface TxIsUnspent {
  spent       : false
  spent_at    : null
  spent_sig   : null
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
