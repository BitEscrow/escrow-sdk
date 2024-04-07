import { assert } from '@/core/util/index.js'

import {
  ApiResponse,
  VMDataResponse,
  VMListResponse,
  WitnessData
} from '@/core/types/index.js'

import { EscrowClient } from '../../class/client.js'

/**
 * Return a list of verified witnesses
 * that are associated with the contract.
 */
function list_witness_api (client : EscrowClient) {
  return async (vmid : string) : Promise<ApiResponse<VMListResponse>> => {
     // Validate the contract id.
    assert.is_hash(vmid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/vm/${vmid}/list`
    // Return the response.
    return client.fetcher<VMListResponse>({ url })
  }
}

/**
 * Submit a signed statement to the contract.
 */
function submit_witness_api (client : EscrowClient) {
  return async (
    vmid    : string,
    witness : WitnessData
  ) : Promise<ApiResponse<VMDataResponse>> => {
    // Validate the contract id.
    assert.is_hash(vmid)
    // Formulate the request url.
    const host = client.server_url
    const url  = `${host}/api/vm/${vmid}/submit`
    // Formulate the request body.
    const init = {
      method  : 'POST',
      body    : JSON.stringify(witness),
      headers : { 'content-type': 'application/json' }
    }
    // Return the response.
    return client.fetcher<VMDataResponse>({ url, init })
  }
}

/**
 * Return a list of committed deposits
 * that are associated with the contract.
 */
function read_vm_state_api (client : EscrowClient) {
  return async (vmid : string) : Promise<ApiResponse<VMDataResponse>> => {
    // Validate the contract id.
    assert.is_hash(vmid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/vm/${vmid}`
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
