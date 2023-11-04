
import { create_proof }     from '../../lib/proof.js'
import { create_return_tx } from '../../lib/return.js'
import { now }              from '../../lib/util.js'
import { REFUND_TX_WEIGHT } from '../../config.js'

import EscrowDeposit from '../class/deposit.js'
import EscrowClient  from '../class/client.js'

import {
  get_deposit_address,
  get_deposit_ctx
} from '../../lib/deposit.js'

import {
  create_covenant,
  create_return
} from '../../lib/session.js'

import { validate_registration } from '../../validators/index.js'

import {
  DepositConfig,
  DepositData,
  DepositInfo,
  DepositTemplate,
  Literal
} from '../../types/index.js'

import * as assert from '@/assert.js'

function create_template_api (client : EscrowClient) {
  return async (
    agent_id  : string,
    agent_key : string,
    sequence  : number,
    txid      : string,
    options  ?: DepositConfig
  ) => {
    const { cid, network = 'regtest' } = options ?? {}
    const pub  = client.signer.pubkey
    const ctx  = get_deposit_ctx(agent_key, pub, sequence)
    const addr = get_deposit_address(ctx, network)
    const odat = await client.oracle.get_spend_out({ txid, address : addr })
    assert.ok(odat !== null, 'transaction output not found')
    const utxo = odat.txspend
    const rtx  = create_return_tx(ctx, client.signer, utxo, options)
    const tmpl : DepositTemplate = { agent_id, return_tx : rtx }
    if (cid !== undefined) {
      const ct  = await client.contract.read(cid)
      const cov = create_covenant(ctx, ct.data, client.signer, utxo)
      tmpl.covenant = cov
    }
    return tmpl
  }
}

function read_deposit_api (client : EscrowClient) {
  return async (
    deposit_id : string
  ) : Promise<EscrowDeposit> => {
    assert.is_hash(deposit_id)
    const url = `${client.host}/api/deposit/${deposit_id}`
    const tkn = create_proof(client.signer, url, { stamp : now() })
    const opt = { headers : { proof : tkn } }
    const res = await client.fetcher<DepositData>(url, opt)
    if (!res.ok) throw res.error
    return new EscrowDeposit(client, res.data)
  }
}

function register_deposit_api (client : EscrowClient) {
  return async (
    template : DepositTemplate
  ) : Promise<EscrowDeposit> => {
    validate_registration(template)
    const opt = {
      method  : 'POST', 
      body    : JSON.stringify(template),
      headers : { 'content-type' : 'application/json' }
    }
    const url = `${client.host}/api/deposit/register`
    const res = await client.fetcher<DepositData>(url, opt)
    if (!res.ok) throw res.error
    return new EscrowDeposit(client, res.data)
  }
}

function request_deposit_api (client : EscrowClient) {
  return async (
    params : Record<string, Literal> = {}
  ) : Promise<DepositInfo> => {
    const arr = Object.entries(params).map(([ k, v ]) => [ k, String(v) ])
    const qry = new URLSearchParams(arr).toString()
    const url = `${client.host}/api/deposit/request?${qry}`
    const ret = await client.fetcher<DepositInfo>(url)
    if (!ret.ok) throw new Error(ret.error)
    return ret.data
  }
}

function list_deposit_api (client : EscrowClient) {
  return async () : Promise<EscrowDeposit[]> => {
    const url = `${client.host}/api/deposit/list`
    const tkn = create_proof(client.signer, url, { stamp : now() })
    const opt = { headers : { token : tkn } }
    const res = await client.fetcher<DepositData[]>(url, opt)
    if (!res.ok) throw res.error
    return res.data.map(e => new EscrowDeposit(client, e))
  }
}

function close_deposit_api (client : EscrowClient) {
  return async (
    address : string,
    deposit : DepositData | EscrowDeposit,
    txfee  ?: number
  ) : Promise<EscrowDeposit> => {
    if (deposit instanceof EscrowDeposit) {
      deposit = deposit.data
    }
    if (txfee === undefined) {
      const rate = await client.oracle.get_fee_target(6)
      txfee = Math.ceil(rate * REFUND_TX_WEIGHT)
    }
    const dpid = deposit.deposit_id
    const req  = create_return(address, deposit, client.signer, txfee)
    const url  = `${client._host}/api/deposit/${dpid}/close`
    const body = JSON.stringify(req)
    const tkn  = create_proof(client.signer, url + body, { stamp : now() })
    const opt  = {
      body,
      headers : {
        'content-type': 'application/json',
        token : tkn
      },
      method  : 'POST'
    }
    const res = await client.fetcher<DepositData>(url, opt)
    if (!res.ok) throw res.error
    return new EscrowDeposit(client, res.data)
  }
}

function status_deposit_api (client : EscrowClient) {
  return async (
    deposit_id : string
  ) : Promise<EscrowDeposit> => {
    assert.is_hash(deposit_id)
    const url = `${client.host}/api/deposit/${deposit_id}/status`
    const tkn = create_proof(client.signer, url, { stamp : now() })
    const opt = { headers : { proof : tkn } }
    const res = await client.fetcher<DepositData>(url, opt)
    if (!res.ok) throw res.error
    return new EscrowDeposit(client, res.data)
  }
}

export default {
  close    : close_deposit_api,
  create   : create_template_api,
  list     : list_deposit_api,
  read     : read_deposit_api,
  register : register_deposit_api,
  request  : request_deposit_api,
  status   : status_deposit_api
}
