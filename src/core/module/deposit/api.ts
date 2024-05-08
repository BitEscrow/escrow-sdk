import {
  AccountTemplate,
  CloseRequest,
  CommitRequest,
  ContractData,
  DepositData,
  LockRequest,
  RegisterRequest,
  SignerAPI,
  TxOutput
} from '@/core/types/index.js'

import DepositSchema from '@/core/schema/deposit.js'

/* Local Imports */

import { create_covenant }    from '@/core/lib/covenant.js'
import { create_return_psig } from '@/core/lib/return.js'

/**
 * Create a registration request object.
 */
export function create_register_req (
  feerate   : number,
  request   : AccountTemplate,
  signer    : SignerAPI,
  utxo      : TxOutput
) : RegisterRequest {
  const registration = { ...request, feerate, utxo }
  const return_psig  = create_return_psig(registration, signer)
  // Parse and return a valid register request object.
  return DepositSchema.register_req.parse({ ...registration, return_psig })
}

/**
 * Create a registration request object.
 */
export function create_commit_req (
  feerate  : number,
  contract : ContractData,
  request  : AccountTemplate,
  signer   : SignerAPI,
  utxo     : TxOutput
) : CommitRequest {
  const registration = create_register_req(feerate, request, signer, utxo)
  const covenant     = create_covenant(contract, registration, signer)
  // Parse and return a valid register request object.
  return DepositSchema.commit_req.parse({ ...registration, covenant })
}

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
