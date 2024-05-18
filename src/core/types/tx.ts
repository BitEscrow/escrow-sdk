import { ScriptData } from '@scrow/tapscript'

export type TxSpendState   = TxIsSpent     | TxIsUnspent
export type TxSettleState  = TxIsSettled   | TxNotSettled
export type TxConfirmState = TxIsConfirmed | TxIsUnconfirmed

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

export interface TxIsSettled {
  settled     : true
  settled_at  : number
  settled_sig : string
}

export interface TxNotSettled {
  settled     : false
  settled_at  : null
  settled_sig : null
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
