import EscrowClient   from '../class/client.js'
import EscrowContract from '../class/contract.js'

import {
  ContractData,
  WitnessData,
} from '../../types/index.js'

import * as assert from '@/assert.js'

function read_witness_api (client : EscrowClient) {
  return async (
    wid : string
  ) : Promise<WitnessData> => {
    assert.is_hash(wid)
    const url = `${client.host}/api/witness/${wid}`
    const res = await client.fetcher<WitnessData>(url)
    if (!res.ok) throw res.error
    return res.data
  }
}

function list_witness_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<WitnessData[]> => {
    assert.is_hash(cid)
    const url = `${client.host}/api/contract/${cid}/witness`
    const res = await client.fetcher<WitnessData[]>(url)
    if (!res.ok) throw res.error
    return res.data
  }
}

function submit_witness_api (client : EscrowClient) {
  return async (
    cid      : string,
    witness  : WitnessData
  ) : Promise<EscrowContract> => {
    assert.is_hash(cid)
    const opt = {
      method  : 'POST', 
      body    : JSON.stringify(witness),
      headers : { 'content-type' : 'application/json' }
    }
    const url = `${client._host}/api/contract/${cid}/submit`
    const res = await client.fetcher<ContractData>(url, opt)
    if (!res.ok) throw res.error
    return new EscrowContract(client, res.data)
  }
}

export default {
  list   : list_witness_api,
  read   : read_witness_api,
  submit : submit_witness_api
}