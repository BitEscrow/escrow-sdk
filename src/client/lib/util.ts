import { Buff, Bytes } from '@cmdcode/buff'
import { cbc }         from '@noble/ciphers/aes'

export function decrypt (
  payload : Bytes,
  secret  : Bytes,
  vector  : Bytes
) {
  const dat = Buff.bytes(payload)
  const sec = Buff.bytes(secret)
  const vec = Buff.bytes(vector)
  const dec = cbc(sec, vec).decrypt(dat)
  return Buff.raw(dec)
}

export function encrypt (
  payload : Bytes,
  secret  : Bytes,
  vector  : Bytes
) {
  const dat = Buff.bytes(payload)
  const sec = Buff.bytes(secret)
  const vec = Buff.bytes(vector)
  return Buff.raw(cbc(sec, vec).encrypt(dat))
}
