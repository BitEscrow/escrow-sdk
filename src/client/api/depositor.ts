import { Buff }             from '@cmdcode/buff'
import { parse_extkey }     from '@cmdcode/crypto-tools/hd'
import { EscrowSigner }     from '@/client/class/signer.js'
import { get_deposit_ctx }  from '@/lib/deposit.js'
import { verify_account }   from '@/client/validators/deposit.js'

import {
  create_covenant,
  create_return_psig
} from '@/lib/session.js'

import {
  AccountDataResponse,
  ApiResponse,
  ContractData,
  CovenantData,
  DepositAccount,
  DepositData,
  TxOutput
} from '@/types/index.js'

export function request_account_api (signer : EscrowSigner) {
  return async (
    locktime : number,
    index   ?: number
  ) : Promise<ApiResponse<AccountDataResponse>> => {
    const deposit_pk = signer.pubkey
    const spend_xpub = signer.get_account(index).xpub
    const req = { deposit_pk, locktime, spend_xpub }
    return signer.client.deposit.request(req)
  }
}

export function verify_account_api (signer : EscrowSigner) {
  return (account : DepositAccount) : void => {
    verify_account(account, signer)
  }
}

export function commit_utxo_api (signer : EscrowSigner) {
  return async (
    account  : DepositAccount,
    contract : ContractData,
    utxo     : TxOutput
  ) : Promise<CovenantData> => {
    // Unpack the deposit object.
    const { agent_pk, sequence, spend_xpub } = account
    // Check if account xpub is valid.
    if (!signer.has_account(spend_xpub)) {
      throw new Error('account xpub is not recognized by master wallet')
    }
    // Define our pubkey as the deposit pubkey.
    const deposit_pk = signer.pubkey
    // Define our xpub as the return pubkey.
    const return_pk  = parse_extkey(spend_xpub).pubkey
    // Get the context object for our deposit account.
    const ctx  = get_deposit_ctx(agent_pk, deposit_pk, return_pk, sequence)
    // Create a covenant with the contract and deposit.
    return create_covenant(ctx, contract, signer._signer, utxo)
  }
}

export function commit_deposit_api (signer : EscrowSigner) {
  return async (
    contract : ContractData,
    deposit  : DepositData
  ) : Promise<CovenantData> => {
    // Unpack the deposit object.
    const { 
      agent_pk, sequence, txid, vout, 
      value, scriptkey, spend_xpub
    } = deposit
    // Check if account xpub is valid.
    if (!signer.has_account(spend_xpub)) {
      throw new Error('account xpub is not recognized by master wallet')
    }
    // Define our pubkey as the deposit pubkey.
    const deposit_pk = signer.pubkey
    // Define our xpub as the return pubkey.
    const return_pk  = parse_extkey(spend_xpub).pubkey
    // Get the context object for our deposit account.
    const ctx  = get_deposit_ctx(agent_pk, deposit_pk, return_pk, sequence)
    // Define utxo object from deposit data.
    const utxo = { txid, vout, value, scriptkey }
    // Create a covenant with the contract and deposit.
    return create_covenant(ctx, contract, signer._signer, utxo)
  }
}

export function close_deposit_api (signer : EscrowSigner) {
  return async (
    deposit  : DepositData,
    txfee    : number,
    address ?: string
  ) : Promise<string> => {
    // Unpack signer object.
    const { txid } = deposit
    if (address === undefined) {
      // Compute an index value from the deposit txid.
      const acct = Buff.hex(txid).slice(0, 4).num
      // Generate refund address.
      address = signer.get_account(acct).new_address()
    }
    // Create the return transaction.
    return create_return_psig(deposit, signer._signer, txfee)
  }
}

export default function (signer : EscrowSigner) {
  return {
    request_account : request_account_api(signer),
    verify_account  : verify_account_api(signer),
    close_account   : close_deposit_api(signer),
    commit_utxo     : commit_utxo_api(signer),
    commit_deposit  : commit_deposit_api(signer)
  }
}
