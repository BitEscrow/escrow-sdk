import {
  ContractData,
  ContractDigest
} from '@/core/types/index.js'

import * as schema from '@/core/schema/index.js'

/**
 * Convert contract data into a digest.
 */
export async function create_contract_digest (
  contract : ContractData
) : Promise<ContractDigest> {
  const {
    activated, balance, est_txfee, est_txsize, pending, settled, settled_at,
    spent, spent_at, spent_txid, status, total, txin_count, updated_at, vm_state
  } = contract

  return schema.contract.digest.parseAsync({
    activated,
balance,
est_txfee,
est_txsize,
pending,
settled,
settled_at,
    spent,
spent_at,
spent_txid,
status,
total,
txin_count,
updated_at,
vm_state
  })
}

/**
 * Update a contract using a digest.
 */
export async function update_contract (
  data   : ContractData,
  digest : ContractDigest
) {
  const parser = schema.contract.data
  return parser.parseAsync({ ...data, ...digest })
}
