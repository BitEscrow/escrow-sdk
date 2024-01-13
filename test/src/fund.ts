import { ContractData }       from '@scrow/core'
import { create_spend_psigs } from '@scrow/core/session'
import { create_return_tx }   from '@scrow/core/return'
import { create_timelock }    from '@scrow/core/tx'
import { get_utxo }           from './core.js'
import { EscrowMember }       from './types.js'

import {
  get_deposit_address,
  get_deposit_ctx
} from '@scrow/core/deposit'

const SEQUENCE = create_timelock(60 * 60 * 2)

export function get_funds (
  contract : ContractData,
  members  : EscrowMember[],
  txfee     = 1000 
) {
  const { agent_id, agent_pk } = contract
  const cli       = members[0].wallet.client
  const network   = contract.terms.network
  const value     = Math.ceil(contract.total / 3 + txfee)
  const templates = members.map(async mbr => {
    const ctx  = get_deposit_ctx(agent_pk, mbr.signer.pubkey, SEQUENCE)
    const addr = get_deposit_address(ctx, network)
    await mbr.wallet.ensure_funds(value)
    const txid = await mbr.wallet.send_funds(value, addr)
    const txo  = await get_utxo(cli, addr, txid)
    const ret  = await mbr.wallet.new_address
    const rtx  = create_return_tx(ret, ctx, mbr.signer, txo, txfee)
    const cov  = create_spend_psigs(ctx, contract, mbr.signer, txo)
    return { agent_id, covenant : cov, return_tx : rtx }
  })

  return Promise.all(templates)
}
