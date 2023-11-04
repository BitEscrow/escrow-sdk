import { EscrowClient } from '../index.js'
import { create_proof } from '../../lib/proof.js'
import { now }          from '../../lib/util.js'
import EscrowContract   from '../class/contract.js'

import {
  validate_proposal,
  verify_proposal
} from '../../validators/index.js'

import { ContractData } from '../../types/index.js'

import * as assert from '@/assert.js'

function create_contract_api (client : EscrowClient) {
  return async (
    proposal : Record<string, any>
  ) : Promise<EscrowContract> => {
    validate_proposal(proposal)
    verify_proposal(proposal)
    const url   = `${client.host}/api/contract/create`
    const body  = JSON.stringify(proposal)
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

function read_contract_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<EscrowContract> => {
    assert.is_hash(cid)
    const url = `${client.host}/api/contract/${cid}`
    const res = await client.fetcher<ContractData>(url)
    if (!res.ok) throw res.error
    return new EscrowContract(client, res.data)
  }
}

function list_contract_api (client : EscrowClient) {
  return async () : Promise<EscrowContract[]> => {
    const url = `${client.host}/api/contract/list`
    const tkn = create_proof(client.signer, url, { stamp : now() })
    const opt = { headers : { token : tkn } }
    const res = await client.fetcher<ContractData[]>(url, opt)
    if (!res.ok) throw res.error
    return res.data.map(e => new EscrowContract(client, e))
  }
}

function cancel_contract_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<EscrowContract> => {
    assert.is_hash(cid)
    const url = `${client.host}/api/contract/${cid}/cancel`
    const tkn = create_proof(client.signer, url, { stamp : now() })
    const opt = { headers : { token : tkn } }
    const res = await client.fetcher<ContractData>(url, opt)
    if (!res.ok) throw res.error
    return new EscrowContract(client, res.data)
  }
}

function status_contract_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<EscrowContract> => {
    assert.is_hash(cid)
    const url = `${client.host}/api/contract/${cid}/status`
    const res = await client.fetcher<ContractData>(url)
    if (!res.ok) throw res.error
    return new EscrowContract(client, res.data)
  }
}

export default {
  cancel : cancel_contract_api,
  create : create_contract_api,
  list   : list_contract_api,
  read   : read_contract_api,
  status : status_contract_api
}
