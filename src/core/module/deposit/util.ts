import { Buff }                from '@cmdcode/buff'
import { GET_INIT_RECV_STATE } from '@/core/lib/tx.js'

import {
  OracleTxSpendData,
  TxConfirmState
} from '@/core/types/index.js'

export function get_deposit_id (
  created_at : number,
  dep_hash   : string,
  pubkey     : string
) : string {
  const cat  = Buff.num(created_at, 4)
  const hash = Buff.hex(dep_hash, 64)
  const pub  = Buff.hex(pubkey, 32)
  return Buff.join([ cat, hash, pub ]).digest.hex
}

/**
 * Compute the spending state of a deposit,
 * using transaction data from an oracle.
 */
export function get_utxo_state (
  locktime  : number,
  utxo_data : OracleTxSpendData
) : TxConfirmState {
  const { status } = utxo_data
  if (status.confirmed) {
      const expires_at = status.block_time + locktime
      return { ...status, expires_at }
  } else {
    return GET_INIT_RECV_STATE()
  }
}
