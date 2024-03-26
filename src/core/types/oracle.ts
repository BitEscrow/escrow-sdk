import { TxOutput } from './tx.js'

export type OracleFeeEstimate = Record<string, number>
export type OracleTxStatus    = OracleConfirmed | OracleUnconfirmed
export type OracleSpendState  = OracleTxOutSpent | OracleTxOutUnspent

interface OracleConfirmed {
  confirmed    : true
  block_hash   : string
  block_height : number
  block_time   : number
}

interface OracleUnconfirmed {
  confirmed : false
}

interface OracleTxOutSpent {
  spent  : true
  txid   : string
  vin    : number
  status : OracleTxStatus
}

interface OracleTxOutUnspent {
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
  status   : OracleTxStatus
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

export interface OracleSpendData {
  txspend : TxOutput
  status  : OracleTxStatus
  state   : OracleSpendState
}

export interface OracleUtxo {
  txid   : string
  vout   : number
  status : OracleTxStatus
  value  : number
}
