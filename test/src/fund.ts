import { create_covenant }  from '@scrow/core/session'
import { create_timelock }  from '@scrow/core/tx'
import { get_utxo }         from './core.js'
import { CoreSigner }       from './types.js'

import {
  assert,
  ContractData
} from '@scrow/core'

import {
  get_deposit_address,
  get_deposit_ctx
} from '@scrow/core/deposit'

const locktime = 60 * 60 * 2

export async function register_funds (
  contract : ContractData,
  members  : CoreSigner[],
  txfee     = 1000 
) {
  const { agent_pk } = contract
  const cli       = members[0].core.client
  const faucet    = cli.core.faucet
  const network   = contract.terms.network
  const value     = Math.ceil(contract.total / 3 + txfee)
  const templates = members.map(async (mbr) => {
    const deposit_pk = mbr.signer.pubkey
    const return_pk  = mbr.wallet.pubkey
    const sequence   = create_timelock(locktime)
    const spend_xpub = mbr.wallet.xpub
    const ctx  = get_deposit_ctx(agent_pk, deposit_pk, return_pk, sequence)
    const addr = get_deposit_address(ctx, network)
    await faucet.ensure_funds(value)
    const txid = await faucet.send_funds(value, addr)
    const utxo = await get_utxo(cli, addr, txid)
    assert.exists(utxo)
    const covenant = create_covenant(ctx, contract, mbr.signer, utxo)
    return { covenant, deposit_pk, sequence, spend_xpub, utxo }
  })
  await cli.mine_blocks(1)
  return Promise.all(templates)
}
