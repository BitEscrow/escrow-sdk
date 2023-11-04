import { Bytes }  from '@cmdcode/buff'
import { Signer } from '../signer.js'

export type SignDevice = (msg : Bytes) => string
export type SignerAPI  = Signer

export interface SignerOptions {
  aux         ?: Bytes | null
  adaptor     ?: string
  nonce_tweak ?: Bytes
  key_tweak   ?: Bytes
  throws      ?: boolean
}

export interface SignerConfig {
  hd_code  ?: Bytes
  hd_path  ?: string
  recovery ?: Bytes
}
