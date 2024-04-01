import { KeyContext } from '@cmdcode/musig2'

import {
  ScriptWord,
  TapContext
} from '@scrow/tapscript'

import { Network }  from './base.js'
import { TxOutput } from './tx.js'

import { CovenantData, SessionToken } from './covenant.js'

export interface AccountRequest {
  deposit_pk  : string
  locktime    : number
  network     : Network
  return_addr : string
}

export interface AccountContext {
  deposit_addr : string
  deposit_pk   : string
  key_data     : KeyContext
  network      : Network
  return_addr  : string
  script       : ScriptWord[]
  sequence     : number
  session      : SessionToken
  tap_data     : TapContext
}

export interface AccountData {
  acct_id      : string
  created_at   : number
  deposit_addr : string
  deposit_pk   : string
  locktime     : number
  network      : Network
  return_addr  : string
  server_pk    : string
  server_sig   : string
  server_tkn   : string
}

export interface AccountTemplate {
  deposit_pk  : string
  locktime    : number
  network     : Network
  return_addr : string
  server_tkn  : string
}

export interface RegisterTemplate extends AccountTemplate {
  feerate : number
  utxo    : TxOutput
}

export interface RegisterRequest extends RegisterTemplate {
  return_psig : string
}

export interface CommitRequest extends RegisterRequest {
  covenant : CovenantData
}
