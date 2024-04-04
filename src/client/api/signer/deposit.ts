import { verify_account }  from '@/core/validation/account.js'
import { verify_contract } from '@/core/validation/contract.js'
import { verify_deposit }  from '@/core/validation/deposit.js'

import {
  create_close_req,
  create_commit_req,
  create_lock_req,
  create_register_req
} from '@/core/lib/deposit.js'

import {
  CloseRequest,
  CommitRequest,
  ContractData,
  AccountData,
  DepositData,
  LockRequest,
  TxOutput,
  RegisterRequest
} from '@/core/types/index.js'

import { EscrowSigner }   from '../../class/signer.js'

export function request_deposits_api (esigner : EscrowSigner) {
  return () => {
    const pub  = esigner.pubkey
    const host = esigner.server_url
    const url  = `${host}/api/deposit/list/${pub}`
    const content = 'GET' + url
    return esigner._signer.gen_token(content)
  }
}

export function register_funds_api (esigner : EscrowSigner) {
  return (
    account : AccountData,
    feerate : number,
    utxo    : TxOutput
  ) : RegisterRequest => {
    esigner.check_issuer(account.server_pk)
    verify_account(account, esigner._signer)
    return create_register_req(feerate, account, esigner._signer, utxo)
  }
}

export function commit_funds_api (esigner : EscrowSigner) {
  return (
    account  : AccountData,
    contract : ContractData,
    feerate  : number,
    utxo     : TxOutput
  ) : CommitRequest => {
    esigner.check_issuer(account.server_pk)
    verify_account(account, esigner._signer)
    return create_commit_req(feerate, contract, account, esigner._signer, utxo)
  }
}

export function lock_funds_api (esigner : EscrowSigner) {
  return (
    contract : ContractData,
    deposit  : DepositData
  ) : LockRequest => {
    esigner.check_issuer(contract.server_pk)
    esigner.check_issuer(deposit.server_pk)
    verify_contract(contract)
    verify_deposit(deposit, esigner._signer)
    return create_lock_req(contract, deposit, esigner._signer)
  }
}

export function close_account_api (esigner : EscrowSigner) {
  return (
    deposit : DepositData,
    feerate : number
  ) : CloseRequest => {
    esigner.check_issuer(deposit.server_pk)
    verify_deposit(deposit, esigner._signer)
    return create_close_req(deposit, feerate, esigner._signer)
  }
}

export default function (esigner : EscrowSigner) {
  return {
    close    : close_account_api(esigner),
    commit   : commit_funds_api(esigner),
    list     : request_deposits_api(esigner),
    lock     : lock_funds_api(esigner),
    register : register_funds_api(esigner)
  }
}
