import EscrowClient        from '../class/client.js'
import EscrowContract      from '../class/contract.js'
import EscrowDeposit       from '../class/deposit.js'
import { get_deposit_ctx } from '../../lib/deposit.js'
import { create_proof }    from '../../lib/proof.js'
import { create_covenant } from '../../lib/session.js'
import { parse_txout }     from '../../lib/tx.js'
import { now }             from '../../lib/util.js'

import {
  ContractData,
  DepositData
} from '../../types/index.js'

import * as assert from '../../assert.js'

function list_covenant_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<EscrowDeposit[]> => {
    assert.is_hash(cid)
    const url = `${client.host}/api/contract/${cid}/funds`
    const res = await client.fetcher<DepositData[]>(url)
    if (!res.ok) throw res.error
    return res.data.map(e => new EscrowDeposit(client, e))
  }
}

function add_covenant_api (client : EscrowClient) {
  return async (
    contract : ContractData | EscrowContract,
    deposit  : DepositData  | EscrowDeposit
  ) : Promise<EscrowContract> => {
    if (contract instanceof EscrowContract) {
      contract = contract.data
    }
    if (deposit instanceof EscrowDeposit) {
      deposit = deposit.data
    }
    const { agent_key, deposit_id, deposit_key, sequence } = deposit
    const ctx   = get_deposit_ctx(agent_key, deposit_key, sequence)
    const txo   = parse_txout(deposit)
    const cov   = create_covenant(ctx, contract, client.signer, txo)
    const url   = `${client.host}/api/deposit/${deposit_id}/add`
    const body  = JSON.stringify(cov)
    const token = create_proof(client.signer, url + body, { stamp : now() })
    const opt   = {
      body,
      method  : 'POST',
      headers : { 'content-type' : 'application/json', token }
    }
    const res = await client.fetcher<ContractData>(url, opt)
    if (!res.ok) throw res.error
    return new EscrowContract(client, res.data)
  }
}

function remove_covenant_api (client : EscrowClient) {
  return async (
    deposit_id : string
  ) : Promise<EscrowContract> => {
    assert.is_hash(deposit_id)
    const url = `${client.host}/api/deposit/${deposit_id}/remove`
    const tkn = create_proof(client.signer, url, { stamp : now() })
    const opt = { headers : { token : tkn } }
    const res = await client.fetcher<ContractData>(url, opt)
    if (!res.ok) throw res.error
    return new EscrowContract(client, res.data)
  }
}

export default {
  add    : add_covenant_api,
  list   : list_covenant_api,
  remove : remove_covenant_api
}
