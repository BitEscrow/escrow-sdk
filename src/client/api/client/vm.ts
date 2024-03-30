import { EscrowClient } from '@/client/class/client.js'
import { ApiResponse }  from '@/types.js'

import {
  VMResponse,
  WitnessData,
  WitnessListResponse
} from '@/core/types/index.js'

import * as assert from '@/assert.js'

/**
 * Return a list of verified witnesses
 * that are associated with the contract.
 */
function list_witness_api (client : EscrowClient) {
  return async (
    vmid : string
  ) : Promise<ApiResponse<WitnessListResponse>> => {
     // Validate the contract id.
    assert.is_hash(vmid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/vm/${vmid}/witness`
    // Return the response.
    return client.fetcher<WitnessListResponse>({ url })
  }
}

/**
 * Submit a signed statement to the contract.
 */
function submit_witness_api (client : EscrowClient) {
  return async (
    vmid    : string,
    witness : WitnessData
  ) : Promise<ApiResponse<VMResponse>> => {
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
    return client.fetcher<VMResponse>({ url, init })
  }
}

/**
 * Return a list of committed deposits
 * that are associated with the contract.
 */
function read_vm_state_api (client : EscrowClient) {
  return async (
    vmid : string
  ) : Promise<ApiResponse<VMResponse>> => {
    // Validate the contract id.
    assert.is_hash(vmid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/witness/{${vmid}}`
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
