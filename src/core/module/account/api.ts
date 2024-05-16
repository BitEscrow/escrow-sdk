import { create_covenant }    from '@/core/lib/covenant.js'
import { create_return_psig } from '@/core/lib/return.js'

import {
  AccountRequest,
  AccountTemplate,
  CommitRequest,
  ContractData,
  Network,
  RegisterRequest,
  SignerAPI,
  TxOutput
} from '@/core/types/index.js'

import AcctSchema from '../../schema/account.js'

/**
 * Create an account request object.
 */
export function create_account_req (
  deposit_pk  : string,
  locktime    : number,
  network     : Network,
  return_addr : string
) : AccountRequest {
  // Parse and return a valid account request object.
  return AcctSchema.account_req.parse({ deposit_pk, locktime, network, return_addr })
}

/**
 * Create a registration request object.
 */
export function create_register_req (
  feerate : number,
  request : AccountTemplate,
  signer  : SignerAPI,
  utxo    : TxOutput
) : RegisterRequest {
  const registration = { ...request, return_rate: feerate, utxo }
  const return_psig  = create_return_psig(registration, signer)
  // Parse and return a valid register request object.
  return AcctSchema.register_req.parse({ ...registration, return_psig })
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
  return AcctSchema.commit_req.parse({ ...registration, covenant })
}
