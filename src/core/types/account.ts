import { KeyContext }   from '@cmdcode/musig2'
import { ChainNetwork } from './base.js'
import { TxOutput }     from './tx.js'

import {
  ScriptWord,
  TapContext
} from '@scrow/tapscript'

import { CovenantData, SessionToken } from './covenant.js'

export interface AccountRequest {
  deposit_pk  : string
  locktime    : number
  network     : ChainNetwork
  return_addr : string
}

export interface AccountContext {
  deposit_addr : string
  deposit_pk   : string
  key_data     : KeyContext
  network      : ChainNetwork
  return_addr  : string
  script       : ScriptWord[]
  sequence     : number
  session      : SessionToken
  tap_data     : TapContext
}

export interface AccountData {
  account_hash : string
  account_id   : string
  agent_pk     : string
  agent_tkn    : string
  created_at   : number
  created_sig  : string
  deposit_addr : string
  deposit_pk   : string
  locktime     : number
  network      : ChainNetwork
  return_addr  : string
}

export interface AccountTemplate {
  agent_tkn   : string
  deposit_pk  : string
  locktime    : number
  network     : ChainNetwork
  return_addr : string
}

export interface RegisterTemplate extends AccountTemplate {
  return_rate : number
  utxo        : TxOutput
}

export interface RegisterRequest extends RegisterTemplate {
  return_psig : string
}

export interface CommitRequest extends RegisterRequest {
  covenant : CovenantData
}

export interface AccountPolicy {
  FEERATE_MIN   : number
  FEERATE_MAX   : number
  GRACE_PERIOD  : number
  LOCKTIME_MIN  : number
  LOCKTIME_MAX  : number
  TOKEN_EXPIRY  : number
}
