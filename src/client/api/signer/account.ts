import { create_account_req }  from '@/core/module/account/index.js'
import { verify_account_data } from '@/core/validation/account.js'
import { assert, parse_err }   from '@/core/util/index.js'
import { EscrowSigner }        from '../../class/signer.js'

import {
  AccountRequest,
  AccountData
} from '@/core/types/index.js'

export function create_account_api (esigner : EscrowSigner) {
  return (
    locktime    : number,
    return_addr : string
  ) : AccountRequest => {
    const deposit_pk = esigner.pubkey
    const network    = esigner.network
    return create_account_req(deposit_pk, locktime, network, return_addr)
  }
}

export function verify_account_api (esigner : EscrowSigner) {
  return (account : AccountData) : string | null => {
    try {
      // Unpack terms from the esigner.
      const { server_pk, _signer } = esigner
      // Assert the correct pubkey is used by the server.
      assert.ok(server_pk === account.server_pk, 'invalid server pubkey')
      // Verify the account data.
      verify_account_data(account, _signer)
      // Return null on success.
      return null
    } catch (err) {
      // Return a string on error.
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
