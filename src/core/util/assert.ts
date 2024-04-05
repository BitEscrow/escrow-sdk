import { Buff, Bytes } from '@cmdcode/buff'
import { Point }       from '@cmdcode/crypto-tools'

import * as util from './base.js'

export function ok (
  value    : unknown,
  message ?: string
) : asserts value {
  if (value === false) {
    throw new Error(message ?? 'Assertion failed!')
  }
}

export function is_bigint (value : unknown) : asserts value is bigint {
  if (!util.is_bigint(value)) {
    throw new TypeError(`invalid bigint: ${String(value)}`)
  }
}

export function is_hex (value : unknown) : asserts value is string {
  if (!util.is_hex(value)) {
    throw new TypeError(`invalid hex: ${String(value)}`)
  }
}

export function is_hash (value : unknown) : asserts value is string {
  if (!util.is_hash(value)) {
    throw new TypeError(`invalid hash: ${String(value)}`)
  }
}

export function size (input : Bytes, size : number) : void {
  const bytes = Buff.bytes(input)
  if (bytes.length !== size) {
    throw new Error(`Invalid input size: ${bytes.hex} !== ${size}`)
  }
}

export function exists <T> (
  value : T | null,
  msg  ?: string
  ) : asserts value is NonNullable<T> {
  if (!util.exists(value)) {
    throw new Error(msg ?? 'Value is null or undefined!')
  }
}

export function min_value (
  bytes : Bytes,
  min   : bigint
) : void {
  const val = Buff.bytes(bytes).big
  if (val < min) {
    throw new TypeError(`Bytes integer value is too low: ${val} < ${min}`)
  }
}

export function valid_pubkey (pubkey : string) {
  try {
    is_hash(pubkey)
    Point.from_x(pubkey)
  } catch {
    throw new Error('Invalid pubkey: ' + String(pubkey))
  }
}

export function valid_address (
  address : string,
  network : string
) {
  const base58 = /^[123mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  const bech32 = /^(bc|tb|bcrt)1([ac-hj-np-z02-9]{39,59})$/

  if (base58.test(address)) {
    throw new Error('Legacy address types are not supported!')
  }

  if (!bech32.test(address)) {
    throw new Error('Invalid address format: ' + address)
  }

  if (
    (network === 'main'    && !address.startsWith('bc')) ||
    (network === 'testnet' && !address.startsWith('tb')) ||
    (network === 'regtest' && !address.startsWith('bcrt'))
  ) {
    throw new Error(`Address does not match "${network}" network: ${address}`)
  }
}
