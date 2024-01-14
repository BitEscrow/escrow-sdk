import { Buff }             from '@cmdcode/buff'
import { create_return_tx } from '../../lib/return.js'
import { EscrowSigner }     from '../class/signer.js'
import { get_deposit_ctx }  from '@/lib/deposit.js'

import {
  create_spend_psigs,
  create_return_psig
} from '@/lib/session.js'

import {
  ContractData,
  DepositData,
  DepositRequest,
  TxOutput
} from '@/types/index.js'

/**
 * Create a deposit template for registration.
 */
export function create_deposit_api (client : EscrowSigner) {
  return async (
    req  : DepositRequest,
    utxo : TxOutput
  ) => {
    // Unpack the deposit object.
    const { agent_id, agent_pk, sequence } = req
    // Define our pubkey.
    const pub  = client.signer.pubkey
    const acct = Buff.hex(utxo.txid).slice(0, 4).num
    const addr = client.wallet.get_account(acct).new_address()
    // Get the context object for our deposit account.
    const ctx  = get_deposit_ctx(agent_pk, pub, sequence)
    // Create the return transaction.
    const rtx  = create_return_tx(addr, ctx, client.signer, utxo)
    return { agent_id, return_tx : rtx }
  }
}

export function fund_contract_api (client : EscrowSigner) {
  return async (
    req      : DepositRequest | DepositData,
    contract : ContractData,
    utxo     : TxOutput
  ) => {
    // Unpack the deposit object.
    const { agent_pk, sequence } = req
    // Define our pubkey.
    const pub  = client.signer.pubkey
    // Get the context object for our deposit account.
    const ctx  = get_deposit_ctx(agent_pk, pub, sequence)
    // Create a covenant with the contract and deposit.
    return create_spend_psigs(ctx, contract, client.signer, utxo)
  }
}

export function create_return_api (client : EscrowSigner) {
  return async (
    deposit : DepositData,
    txfee   : number
  ) => {
    // Unpack client object.
    const { signer, wallet } = client
    const { txid } = deposit
    // Compute an index value from the deposit txid.
    const acct = Buff.hex(txid).slice(0, 4).num
    // Generate refund address.
    const addr = wallet.get_account(acct).new_address()
    // Create the return transaction.
    return create_return_psig(addr, deposit, signer, txfee)
  }
}

export default function (client : EscrowSigner) {
  return {
    create_deposit : create_deposit_api(client),
    create_return  : create_return_api(client),
    fund_contract  : fund_contract_api(client)
  }
}
