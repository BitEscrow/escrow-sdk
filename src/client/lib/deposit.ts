import {
  DepositData,
  DepositDigest
} from '@/core/types/index.js'

import * as schema from '@/core/schema/index.js'

export async function create_deposit_digest (
  deposit : DepositData
) : Promise<DepositDigest> {
  const {
    block_hash, block_height, block_time, covenant, confirmed, expires_at,
    settled, settled_at, spent, spent_at, spent_txid, status, updated_at
  } = deposit

  return schema.deposit.digest.parseAsync({
    block_hash,
block_height,
block_time,
covenant,
confirmed,
expires_at,
    settled,
settled_at,
spent,
spent_at,
spent_txid,
status,
updated_at
  })
}

/**
 * Update a deposit using a digest.
 */
export async function update_deposit (
  data   : DepositData,
  digest : DepositDigest
) {
  const parser = schema.deposit.data
  return parser.parseAsync({ ...data, ...digest })
}
