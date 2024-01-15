import { Buff }             from '@cmdcode/buff'
import { create_return_tx } from '@/lib/return.js'
import { get_deposit_ctx }  from '@/lib/deposit.js'
import { EscrowMember }     from '@/client/class/member.js'

import {
  create_spend_psigs,
  create_return_psig
} from '@/lib/session.js'

import {
  ContractData,
  CovenantData,
  DepositAccount,
  DepositData,
  DepositRegister,
  ReturnData,
  TxOutput
} from '@/types/index.js'

/**
 * Create a deposit template for registration.
 */
export function register_deposit_api (client : EscrowMember) {
  return async (
    acct : DepositAccount,
    utxo : TxOutput
  ) : Promise<DepositRegister> => {
    // Unpack the deposit object.
    const { agent_id, agent_pk, sequence } = acct
    // Define our pubkey.
    const pub  = client.signer.pubkey
    const idx  = Buff.hex(utxo.txid).slice(0, 4).num
    const addr = client.wallet.get_account(idx).new_address()
    // Get the context object for our deposit account.
    const ctx  = get_deposit_ctx(agent_pk, pub, sequence)
    // Create the return transaction.
    const rtx  = create_return_tx(addr, ctx, client.signer, utxo)
    return { agent_id, return_tx : rtx }
  }
}

export function commit_deposit_api (client : EscrowMember) {
  return async (
    req      : DepositAccount | DepositData,
    contract : ContractData,
    utxo     : TxOutput
  ) : Promise<CovenantData> => {
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

export function close_deposit_api (client : EscrowMember) {
  return async (
    deposit  : DepositData,
    txfee    : number,
    address ?: string
  ) : Promise<ReturnData> => {
    // Unpack client object.
    const { signer, wallet } = client
    const { txid } = deposit
    if (address === undefined) {
      // Compute an index value from the deposit txid.
      const acct = Buff.hex(txid).slice(0, 4).num
      // Generate refund address.
      address = wallet.get_account(acct).new_address()
    }
    // Create the return transaction.
    return create_return_psig(address, deposit, signer, txfee)
  }
}

export default function (client : EscrowMember) {
  return {
    create_registration : register_deposit_api(client),
    create_covenant     : commit_deposit_api(client),
    create_refund       : close_deposit_api(client)
  }
}
