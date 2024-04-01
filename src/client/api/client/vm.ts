import { assert } from '@/core/util/index.js'

import {
  ApiResponse,
  VMDataResponse,
  VMReceiptResponse,
  VMStatementResponse,
  WitnessData
} from '@/core/types/index.js'

import { EscrowClient } from '../../class/client.js'

/**
 * Return a list of verified witnesses
 * that are associated with the contract.
 */
function list_witness_api (client : EscrowClient) {
  return async (cid : string) : Promise<ApiResponse<VMStatementResponse>> => {
     // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/vm/${cid}/list`
    // Return the response.
    return client.fetcher<VMStatementResponse>({ url })
  }
}

/**
 * Submit a signed statement to the contract.
 */
function submit_witness_api (client : EscrowClient) {
  return async (
    cid     : string,
    witness : WitnessData
  ) : Promise<ApiResponse<VMReceiptResponse>> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request url.
    const host = client.server_url
    const url  = `${host}/api/vm/${cid}/submit`
    // Formulate the request body.
    const init = {
      method  : 'POST',
      body    : JSON.stringify(witness),
      headers : { 'content-type': 'application/json' }
    }
    // Return the response.
    return client.fetcher<VMReceiptResponse>({ url, init })
  }
}

/**
 * Return a list of committed deposits
 * that are associated with the contract.
 */
function read_vm_state_api (client : EscrowClient) {
  return async (cid : string) : Promise<ApiResponse<VMDataResponse>> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/witness/{${cid}}`
    // Return the response.
    return client.fetcher<VMDataResponse>({ url })
  }
}

export default function (client : EscrowClient) {
  return {
    list   : list_witness_api(client),
    read   : read_vm_state_api(client),
    submit : submit_witness_api(client)
  }
}
