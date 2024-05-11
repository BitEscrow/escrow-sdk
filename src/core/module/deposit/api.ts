import {
  CloseRequest,
  ContractData,
  DepositData,
  LockRequest,
  SignerAPI
} from '@/core/types/index.js'

import DepositSchema from '@/core/schema/deposit.js'

/* Local Imports */

import { create_covenant }    from '@/core/lib/covenant.js'
import { create_return_psig } from '@/core/lib/return.js'

/**
 * Create a lock request object.
 */
export function create_lock_req (
  contract : ContractData,
  deposit  : DepositData,
  signer   : SignerAPI
) : LockRequest {
  const dpid     = deposit.dpid
  const covenant = create_covenant(contract, deposit, signer)
  // Parse and return a valid register request object.
  return DepositSchema.lock_req.parse({ dpid, covenant })
}

/**
 * Create a lock request object.
 */
export function create_close_req (
  deposit  : DepositData,
  feerate  : number,
  signer   : SignerAPI
) : CloseRequest {
  const dpid = deposit.dpid
  const ctx  = { ...deposit, feerate }
  const return_psig = create_return_psig(ctx, signer)
  // Parse and return a valid register request object.
  return DepositSchema.close_req.parse({ dpid, feerate, return_psig })
}
