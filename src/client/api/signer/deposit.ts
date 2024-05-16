import { assert }       from '@/core/util/index.js'
import { EscrowSigner } from '../../class/signer.js'

import {
  verify_contract_data,
  verify_contract_sigs
} from '@/core/validation/contract.js'

import {
  verify_deposit_data,
  verify_deposit_sigs
} from '@/core/validation/deposit.js'

import {
  create_close_req,
  create_lock_req
} from '@/core/module/deposit/index.js'

import {
  CloseRequest,
  ContractData,
  DepositData,
  LockRequest
} from '@/core/types/index.js'

export function request_deposits_api (esigner : EscrowSigner) {
  return () => {
    const host = esigner.server_url
    const url  = `${host}/api/deposit/list`
    const content = 'GET' + url
    return esigner._signer.gen_token(content)
  }
}

export function lock_funds_api (esigner : EscrowSigner) {
  return (
    contract : ContractData,
    deposit  : DepositData
  ) : LockRequest => {
    const { server_pk, _signer } = esigner
    verify_contract_sigs(contract, server_pk)
    verify_contract_data(contract)
    verify_deposit_sigs(deposit, server_pk)
    verify_deposit_data(deposit, _signer)
    return create_lock_req(contract, deposit, _signer)
  }
}

export function cancel_deposit_api (esigner : EscrowSigner) {
  return (dpid : string) => {
    assert.is_hash(dpid)
    const host = esigner.server_url
    const url  = `${host}/api/deposit/${dpid}/cancel`
    const content = 'GET' + url
    return esigner._signer.gen_token(content)
  }
}

export function close_deposit_api (esigner : EscrowSigner) {
  return (
    deposit : DepositData,
    feerate : number
  ) : CloseRequest => {
    const { server_pk, _signer } = esigner
    // Assert the correct pubkey is used by the server.
    verify_deposit_sigs(deposit, server_pk)
    verify_deposit_data(deposit, _signer)
    return create_close_req(deposit, feerate, _signer)
  }
}

export default function (esigner : EscrowSigner) {
  return {
    cancel : cancel_deposit_api(esigner),
    close  : close_deposit_api(esigner),
    list   : request_deposits_api(esigner),
    lock   : lock_funds_api(esigner)
  }
}
