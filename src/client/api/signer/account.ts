import { create_account_req }  from '@/core/module/account/index.js'
import { verify_account_data } from '@/core/validation/account.js'
import { assert, parse_err }   from '@/core/util/index.js'
import { EscrowSigner }        from '../../class/signer.js'

import { create_commit_req, create_register_req } from '@/core/module/account/api.js'

import {
  AccountRequest,
  AccountData,
  TxOutput,
  RegisterRequest,
  ContractData,
  CommitRequest
} from '@/core/types/index.js'

export function request_account_api (esigner : EscrowSigner) {
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

export function register_funds_api (esigner : EscrowSigner) {
  return (
    account : AccountData,
    feerate : number,
    utxo    : TxOutput
  ) : RegisterRequest => {
    const { server_pk, _signer } = esigner
    // Assert the correct pubkey is used by the server.
    assert.ok(server_pk === account.server_pk, 'invalid server pubkey')
    verify_account_data(account, _signer)
    return create_register_req(feerate, account, _signer, utxo)
  }
}

export function commit_funds_api (esigner : EscrowSigner) {
  return (
    account  : AccountData,
    contract : ContractData,
    feerate  : number,
    utxo     : TxOutput
  ) : CommitRequest => {
    const { server_pk, _signer } = esigner
    // Assert the correct pubkey is used by the server.
    assert.ok(server_pk === account.server_pk, 'invalid server pubkey')
    verify_account_data(account, _signer)
    return create_commit_req(feerate, contract, account, _signer, utxo)
  }
}

export default function (esigner : EscrowSigner) {
  return {
    request  : request_account_api(esigner),
    verify   : verify_account_api(esigner),
    register : register_funds_api(esigner),
    commit   : commit_funds_api(esigner)
  }
}
