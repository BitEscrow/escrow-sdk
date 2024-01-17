import { Buff, Bytes }  from '@cmdcode/buff'
import { MusigContext } from '@cmdcode/musig2'

export type HmacTypes  = '256' | '512'
export type SignDevice = (msg : Bytes) => string

export type MusignDevice = (
  ctx : MusigContext, 
  aux : Bytes, 
  opt : SignOptions
) => Buff

export interface CredentialData {
  id   : string
  pub  : string
  sig  : string
  xpub : string
}

export interface SignerAPI {
  id        : string
  pubkey    : string
  backup    : (password : Bytes) => Bytes
  has_id    : (id : Bytes, pubkey : Bytes) => boolean
  get_id    : (id : Bytes) => SignerAPI
  gen_cred  : (idx : number, xpub : string) => CredentialData
  gen_nonce : (data : Bytes) => Buff
  gen_token : (content : string) => string
  hmac      : (size : '256' | '512', ...bytes : Bytes[]) => Buff
  musign    : MusignDevice
  sign      : SignDevice
}

export interface SignOptions {
  nonce_tweak : Bytes
}

export interface WalletAPI {
  xpub : string
  get_account : (id : Bytes) => WalletAPI
  has_address : (addr : string, limit ?: number) => boolean
  new_address : () => string
}
