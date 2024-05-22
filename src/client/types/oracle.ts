import { TxOutput } from '@/core/types/index.js'

export type OracleFeeEstimate = Record<string, number>
export type OracleTxConfState = TxConfirmed | TxUnconfirmed
export type OracleOutSpend    = UtxoSpent   | UtxoUnspent

interface TxConfirmed {
  confirmed    : true
  block_hash   : string
  block_height : number
  block_time   : number
}

interface TxUnconfirmed {
  confirmed : false
}

interface UtxoSpent {
  spent  : true
  txid   : string
  vin    : number
  status : OracleTxConfState
}

interface UtxoUnspent {
  spent : false
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
  status   : OracleTxConfState
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

export interface OracleUtxo {
  txid   : string
  vout   : number
  status : OracleTxConfState
  value  : number
}

export interface OracleUtxoData {
  status : OracleTxConfState
  utxo   : TxOutput
}
