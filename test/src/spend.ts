
import { combine_psigs }   from '@cmdcode/musig2'
import { Signer }          from '@cmdcode/signer'
import { parse_extkey }    from '@cmdcode/crypto-tools/hd'
import { decode_tx }       from '@scrow/tapscript/tx'
import { get_deposit_ctx } from '../../src/lib/deposit.js'
import { parse_txinput }   from '../../src/lib/tx.js'
import { get_entry }       from '../../src/lib/util.js'

import {
  TxData,
  TxPrevout
} from '@scrow/tapscript'

import {
  create_mutex_psig,
  get_mutex_ctx,
  get_return_mutex,
  get_session_id
} from '../../src/lib/session.js'

import {
  ContractData,
  DepositData,
  ReturnData,
  SpendTemplate
} from '../../src/types/index.js'

import * as assert from '../../src/assert.js'

export function create_settlment (
  agent    : Signer,
  contract : ContractData,
  deposits : DepositData[],
  pathname : string
) : TxData {
  const { outputs } = contract
  const output = outputs.find(e => e[0] === pathname)
  assert.exists(output)
  const tx = decode_tx(output[1], false)
  for (const fund of deposits) {
    const txin = parse_txinput(fund)
    const sig  = sign_covenant(agent, contract, fund, output, txin)
    tx.vin.push({ ...txin, witness : [ sig ] })
  }
  return tx
}

export function create_refund (
  agent   : Signer,
  deposit : DepositData,
  request : ReturnData
) : TxData {
  const { agent_pn }           = deposit
  const { pnonce, psig, txhex } = request
  const tx      = decode_tx(txhex, false)
  const txin    = parse_txinput(deposit)
  const pnonces = [ pnonce, agent_pn ]
  const mut_ctx = get_return_mutex(deposit, pnonces, txhex)
  const psig_a  = create_mutex_psig(mut_ctx, agent)
  const musig   = combine_psigs(mut_ctx.mutex, [ psig, psig_a ])
  const sig     = musig.append(0x81).hex
  tx.vin.push({ ...txin, witness : [ sig ] })
  return tx
}

export function sign_covenant (
  agent    : Signer,
  contract : ContractData,
  deposit  : DepositData,
  output   : SpendTemplate,
  txinput  : TxPrevout
) : string {
  const { covenant, deposit_pk, sequence, spend_xpub } = deposit
  const { agent_id, cid, agent_pn } = contract
  assert.exists(covenant)
  const [ label, vout ]   = output
  const { pnonce, psigs } = covenant
  const return_pk = parse_extkey(spend_xpub).pubkey
  const dep_ctx   = get_deposit_ctx(agent.pubkey, deposit_pk, return_pk, sequence)
  const pnonces   = [ pnonce, agent_pn ]
  const sid       = get_session_id(agent_id, cid)
  const mut_ctx   = get_mutex_ctx(dep_ctx, vout, pnonces, sid, txinput)
  const psig_a    = create_mutex_psig(mut_ctx, agent)
  const psig_d    = get_entry(label, psigs)
  const musig     = combine_psigs(mut_ctx.mutex, [ psig_d, psig_a ])
  return musig.append(0x81).hex
}
