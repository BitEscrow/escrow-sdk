import { create_account_req } from '@/core/lib/account.js'
import { verify_account }     from '@/core/validation/account.js'
import { parse_err }          from '@/core/util/index.js'
import { EscrowSigner }       from '../../class/signer.js'

import {
  AccountRequest,
  AccountData
} from '@/core/types/index.js'

export function create_account_api (esigner : EscrowSigner) {
  return (
    return_addr : string,
    locktime   ?: number
  ) : AccountRequest => {
    const acct_pol   = esigner.server_pol.account
    const timelock   = locktime ?? acct_pol.LOCKTIME_MIN
    const deposit_pk = esigner.pubkey
    const network    = esigner.network
    return create_account_req(deposit_pk, timelock, network, return_addr)
  }
}

export function verify_account_api (esigner : EscrowSigner) {
  return (account : AccountData) : string | null => {
    try {
      esigner.check_issuer(account.server_pk)
      verify_account(account, esigner._signer)
      return null
    } catch (err) {
      return parse_err(err)
    }
  }
}

export default function (esigner : EscrowSigner) {
  return {
    create : create_account_api(esigner),
    verify : verify_account_api(esigner)
  }
}
