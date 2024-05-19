import { TxConfirmState }    from '@/core/types/index.js'
import { OracleTxSpendData } from '@/client/types/oracle.js'

/**
 * Compute the spending state of a deposit,
 * using transaction data from an oracle.
 */
export function get_confirm_state (
  locktime  : number,
  utxo_data : OracleTxSpendData
) : TxConfirmState {
  const { status } = utxo_data
  if (status.confirmed) {
      const expires_at = status.block_time + locktime
      return { ...status, expires_at }
  } else {
    return {
      confirmed    : false as const,
      block_hash   : null,
      block_height : null,
      block_time   : null,
      expires_at   : null
    }
  }
}
