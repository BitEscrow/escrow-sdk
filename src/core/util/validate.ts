import { Point }   from '@cmdcode/crypto-tools'
import { Literal } from '../types/index.js'

export function exists <T> (
  value ?: T | null
) : value is NonNullable<T> {
  if (typeof value === 'undefined' || value === null) {
    return false
  }
  return true
}

export function is_bigint (value : unknown) : value is bigint {
  return typeof value === 'bigint'
}

export function is_hex (
  value : unknown
) : value is string {
  if (
    typeof value === 'string'            &&
    value.match(/[^a-fA-F0-9]/) === null &&
    value.length % 2 === 0
  ) {
    return true
  }
  return false
}

export function is_hash (value : unknown) : value is string {
  if (is_hex(value) && value.length === 64) {
    return true
  }
  return false
}

export function is_literal (value : unknown) : value is Literal {
  if (
    typeof value === 'string'  ||
    typeof value === 'number'  ||
    typeof value === 'boolean' ||
    value === null
  ) {
    return true
  }
  return false
}

export function is_stamp (value : unknown) : value is number {
  return (
    typeof value === 'number' &&
    value > 500_000_000       &&
    value <= Number.MAX_SAFE_INTEGER
  )
}

export function is_uint (
  value : unknown,
  max_val = Number.MAX_SAFE_INTEGER
) : value is number {
  if (typeof value === 'string') {
    value = Number(value)
  }
  if (typeof value !== 'number') {
    return false
  }
  return (
    typeof value === 'number' &&
    !isNaN(value)             &&
    value >= 0                &&
    value <= max_val          &&
    Math.floor(value) === value
  )
}

export function is_bip340_pubkey (pubkey : string) {
  if (!is_hash(pubkey)) {
    return 'pubkey format is invalid'
  }
  try {
    Point.from_x(pubkey)
  } catch {
    return 'pubkey is not on secp256k1 curve'
  }
  return null
}

export function is_btc_address (
  address : string,
  network : string
) {
  const base58 = /^[123mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  const bech32 = /^(bc|tb|bcrt)1([ac-hj-np-z02-9]{39,59})$/

  if (base58.test(address)) {
    return 'Legacy address types are not supported'
  }

  if (!bech32.test(address)) {
    return 'Invalid address format: ' + address
  }

  if (
    (network === 'main'    && !address.startsWith('bc')) ||
    (network === 'testnet' && !address.startsWith('tb')) ||
    (network === 'regtest' && !address.startsWith('bcrt'))
  ) {
    return `Address does not match "${network}" network: ${address}`
  }

  return null
}
