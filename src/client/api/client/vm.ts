import { assert } from '@/core/util/index.js'

import {
  ApiResponse,
  VMResponse,
  WitnessData,
  WitnessListResponse
} from '@/core/types/index.js'

import { EscrowClient } from '../../class/client.js'

/**
 * Return a list of verified witnesses
 * that are associated with the contract.
 */
function list_witness_api (client : EscrowClient) {
  return async (cid : string) : Promise<ApiResponse<WitnessListResponse>> => {
     // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/vm/${cid}/witness`
    // Return the response.
    return client.fetcher<WitnessListResponse>({ url })
  }
}

/**
 * Submit a signed statement to the contract.
 */
function submit_witness_api (client : EscrowClient) {
  return async (
    cid     : string,
    witness : WitnessData
  ) : Promise<ApiResponse<VMResponse>> => {
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
    return client.fetcher<VMResponse>({ url, init })
  }
}

/**
 * Return a list of committed deposits
 * that are associated with the contract.
 */
function read_vm_state_api (client : EscrowClient) {
  return async (cid : string) : Promise<ApiResponse<VMResponse>> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/witness/{${cid}}`
    // Return the response.
    return client.fetcher<VMResponse>({ url })
  }
}

export default function (client : EscrowClient) {
  return {
    list   : list_witness_api(client),
    read   : read_vm_state_api(client),
    submit : submit_witness_api(client)
  }
}
