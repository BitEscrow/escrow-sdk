import { Buff }   from '@cmdcode/buff'
import { assert } from '../../util/index.js'

import { ConfirmState, OracleTxRecvStatus } from '../../types/index.js'

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

/**
 * Compute the spending state of a deposit,
 * using transaction data from an oracle.
 */
export function get_confirm_state (
  locktime : number,
  txstatus : OracleTxRecvStatus
) : ConfirmState {
  assert.ok(txstatus.confirmed)
  const expires_at = txstatus.block_time + locktime
  return { ...txstatus, expires_at }
}
