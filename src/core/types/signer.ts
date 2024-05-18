import { Buff, Bytes }  from '@cmdcode/buff'
import { MusigContext } from '@cmdcode/musig2'

export type HmacTypes  = '256' | '512'
export type SignDevice = (msg : Bytes) => string

export type MusignDevice = (
  ctx : MusigContext,
  aux : Bytes,
  opt : SignOptions
) => Buff

export interface SignerAPI {
  pubkey    : string
  id        : string
  has_id    : (id : Bytes, pubkey : Bytes) => boolean
  get_id    : (id : Bytes) => SignerAPI
  hmac      : (size : '256' | '512', ...bytes : Bytes[]) => Bytes
  gen_nonce : (data : Bytes) => Buff
  musign    : MusignDevice
  sign      : SignDevice
}

export interface SignOptions {
  nonce_tweak ?: Bytes
}
