import { Buff } from '@cmdcode/buff'

export function get_deposit_id (
  created_at : number,
  dep_hash   : string,
  pubkey     : string
) {
  const cat  = Buff.num(created_at, 4)
  const hash = Buff.hex(dep_hash, 64)
  const pub  = Buff.hex(pubkey, 32)
  return Buff.join([ cat, hash, pub ]).digest.hex
}
