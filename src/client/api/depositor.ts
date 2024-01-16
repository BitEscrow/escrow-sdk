import { Buff }             from '@cmdcode/buff'
import { create_return_tx } from '@/lib/return.js'
import { get_deposit_ctx }  from '@/lib/deposit.js'
import { EscrowSigner }     from '@/client/class/signer.js'

import {
  create_covenant,
  create_return
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
export function register_deposit_api (client : EscrowSigner) {
  return async (
    acct     : DepositAccount,
    utxo     : TxOutput,
    contract ?: ContractData,
    txfee    ?: number
  ) : Promise<DepositRegister> => {
    // Define a variable for covenant data.
    let covenant : CovenantData | undefined
    // Unpack the deposit object.
    const { agent_id, agent_pk, sequence } = acct
    // Define our pubkey.
    const pub  = client.pubkey
    const idx  = Buff.hex(utxo.txid).slice(0, 4).num
    const addr = client._wallet.get_account(idx).new_address()
    // Get the context object for our deposit account.
    const ctx  = get_deposit_ctx(agent_pk, pub, sequence)
    // Create the return transaction.
    const rtx  = create_return_tx(addr, ctx, client._signer, utxo, txfee)
    // If contract is define, set covenant variable.
    if (contract !== undefined) {
      covenant = create_covenant(ctx, contract, client._signer, utxo)
    }
    return { agent_id, covenant, return_tx : rtx }
  }
}

export function create_covenant_api (client : EscrowSigner) {
  return async (
    contract : ContractData,
    deposit  : DepositData
  ) : Promise<CovenantData> => {
    // Unpack the deposit object.
    const { agent_pk, sequence, txid, vout, value, scriptkey } = deposit
    // Define our pubkey.
    const pub  = client.pubkey
    // Get the context object for our deposit account.
    const ctx  = get_deposit_ctx(agent_pk, pub, sequence)
    // Define utxo object from deposit data.
    const utxo = { txid, vout, value, scriptkey }
    // Create a covenant with the contract and deposit.
    return create_covenant(ctx, contract, client._signer, utxo)
  }
}

export function create_return_api (client : EscrowSigner) {
  return async (
    deposit  : DepositData,
    txfee    : number,
    address ?: string
  ) : Promise<ReturnData> => {
    // Unpack client object.
    const { txid } = deposit
    if (address === undefined) {
      // Compute an index value from the deposit txid.
      const acct = Buff.hex(txid).slice(0, 4).num
      // Generate refund address.
      address = client._wallet.get_account(acct).new_address()
    }
    // Create the return transaction.
    return create_return(address, deposit, client._signer, txfee)
  }
}

export default function (client : EscrowSigner) {
  return {
    create_registration : register_deposit_api(client),
    create_covenant     : create_covenant_api(client),
    create_return       : create_return_api(client)
  }
}
