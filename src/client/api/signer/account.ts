import { parse_extkey }     from '@cmdcode/crypto-tools/hd'
import { EscrowSigner }     from '@/client/class/signer.js'
import { get_deposit_ctx }  from '@/lib/deposit.js'
import { verify_account }   from '@/client/validators/deposit.js'

import {
  create_covenant,
  create_return_psig
} from '@/lib/session.js'

import {
  AccountRequest,
  CloseRequest,
  CommitRequest,
  ContractData,
  DepositAccount,
  DepositData,
  LockRequest,
  TxOutput
} from '@/types/index.js'

export function create_account_api (signer : EscrowSigner) {
  return (
    locktime : number,
    index   ?: number
  ) : AccountRequest => {
    index = index ?? signer._gen_idx()
    const deposit_pk = signer.pubkey
    const spend_xpub = signer.wallet.get(index).xpub
    return { deposit_pk, locktime, spend_xpub }
  }
}

export function verify_account_api (signer : EscrowSigner) {
  return (account : DepositAccount) : boolean => {
    try {
      verify_account(account, signer)
      return true
    } catch (err) {
      return false
    }
  }
}

export function commit_funds_api (signer : EscrowSigner) {
  return (
    account  : DepositAccount,
    contract : ContractData,
    utxo     : TxOutput
  ) : CommitRequest => {
    // Unpack the deposit object.
    const { agent_pk, sequence, spend_xpub } = account
    // Check if account xpub is valid.
    if (!signer.wallet.has(spend_xpub)) {
      throw new Error('account xpub is not recognized by master wallet')
    }
    // Define our pubkey as the deposit pubkey.
    const deposit_pk = signer.pubkey
    // Define our xpub as the return pubkey.
    const return_pk  = parse_extkey(spend_xpub).pubkey
    // Get the context object for our deposit account.
    const ctx  = get_deposit_ctx(agent_pk, deposit_pk, return_pk, sequence)
    // Create a covenant with the contract and deposit.
    const covenant   = create_covenant(ctx, contract, signer._signer, utxo)
    return { covenant, deposit_pk, sequence, spend_xpub, utxo }
  }
}

export function lock_funds_api (signer : EscrowSigner) {
  return (
    contract : ContractData,
    deposit  : DepositData
  ) : LockRequest => {
    // Unpack the deposit object.
    const { 
      agent_pk, sequence, txid, vout, 
      value, scriptkey, spend_xpub
    } = deposit
    // Check if account xpub is valid.
    if (!signer.wallet.has(spend_xpub)) {
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
    const covenant = create_covenant(ctx, contract, signer._signer, utxo)
    return { covenant }
  }
}

export function close_account_api (signer : EscrowSigner) {
  return (
    deposit : DepositData,
    txfee   : number
  ) : CloseRequest => {
    // Create the return transaction.
    const [ pnonce, psig ] = create_return_psig(deposit, signer._signer, txfee)
    return { pnonce, psig, txfee }
  }
}

export default function (signer : EscrowSigner) {
  return {
    create : create_account_api(signer),
    verify : verify_account_api(signer),
    close  : close_account_api(signer),
    commit : commit_funds_api(signer),
    lock   : lock_funds_api(signer)
  }
}
