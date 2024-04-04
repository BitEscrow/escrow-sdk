import { TxOutput } from './tx.js'

export type OracleFeeEstimate  = Record<string, number>
export type OracleTxRecvStatus = TxConfirmed | TxUnconfirmed
export type OracleTxSpendState = TxOutSpent  | TxOutUnspent

interface TxConfirmed {
  confirmed    : true
  block_hash   : string
  block_height : number
  block_time   : number
}

interface TxUnconfirmed {
  confirmed : false
}

interface TxOutSpent {
  spent  : true
  txid   : string
  vin    : number
  status : OracleTxRecvStatus
}

interface TxOutUnspent {
  spent : false
}

export interface OracleQuery {
  txid     : string
  vout    ?: number
  address ?: string
}

export interface OracleTxData {
  txid     : string
  version  : number
  locktime : number
  vin      : OracleTxIn[]
  vout     : OracleTxOut[]
  size     : number
  weight   : number
  fee      : number
  status   : OracleTxRecvStatus
}

export interface OracleTxIn {
  txid          : string
  vout          : number
  prevout       : OracleTxOut | null
  scriptsig     : string
  scriptsig_asm : string
  witness       : string[]
  sequence      : number
  is_coinbase   : boolean
}

export interface OracleTxOut {
  scriptpubkey          : string
  scriptpubkey_asm      : string
  scriptpubkey_type     : string
  scriptpubkey_address ?: string
  value                 : number
}

export interface OracleTxSpendData {
  txout  : TxOutput
  status : OracleTxRecvStatus
  state  : OracleTxSpendState
}

export interface OracleUtxo {
  txid   : string
  vout   : number
  status : OracleTxRecvStatus
  value  : number
}
