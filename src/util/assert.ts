import { Buff, Bytes } from '@cmdcode/buff'
import * as validate   from './validate.js'

export function ok (
  value    : unknown,
  message ?: string
) : asserts value {
  if (value === false) {
    throw new Error(message ?? 'Assertion failed!')
  }
}

export function is_bigint (value : unknown) : asserts value is bigint {
  if (!validate.is_bigint(value)) {
    throw new TypeError(`invalid bigint: ${String(value)}`)
  }
}

export function is_hex (value : unknown) : asserts value is string {
  if (!validate.is_hex(value)) {
    throw new TypeError(`invalid hex: ${String(value)}`)
  }
}

export function is_hash (value : unknown) : asserts value is string {
  if (!validate.is_hash(value)) {
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
  if (!validate.exists(value)) {
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

export function is_valid_pubkey (pubkey : string) {
  const err = validate.is_bip340_pubkey(pubkey)
  if (err !== null) {
    throw new Error(err)
  }
}

export function is_valid_address (
  address : string,
  network : string
) {
  const err = validate.is_btc_address(address, network)
  if (err !== null) {
    throw new Error(err)
  }
}
