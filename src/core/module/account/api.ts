import {
  AccountRequest,
  Network
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
  return AcctSchema.request.parse({ deposit_pk, locktime, network, return_addr })
}
