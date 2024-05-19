import { assert }       from '@/core/util/index.js'
import { WitnessData }  from '@/core/types/index.js'
import { EscrowClient } from '@/client/class/client.js'

import {
  ApiResponse,
  VMDataResponse,
  VMListResponse,
  VMSubmitResponse,
  WitnessListResponse
} from '@/client/types/index.js'

/**
 * Return a list of verified witnesses
 * that are associated with the contract.
 */
function list_machines_api (client : EscrowClient) {
  return async (
    token  : string
  ) : Promise<ApiResponse<VMListResponse>> => {
    // Define the request url.
    const host = client.server_url
    const url  = `${host}/api/vm/list`
    // Define the request config.
    const init = {
      method  : 'GET',
      headers : { Authorization: 'Bearer ' + token }
    }
    // Return the response.
    return client.fetcher<VMListResponse>({ url, init })
  }
}

/**
 * Submit a signed statement to the contract.
 */
function submit_witness_api (client : EscrowClient) {
  return async (
    vmid    : string,
    witness : WitnessData
  ) : Promise<ApiResponse<VMSubmitResponse>> => {
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
    return client.fetcher<VMSubmitResponse>({ url, init })
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

function list_commits_api (client : EscrowClient) {
  return async (vmid : string) : Promise<ApiResponse<WitnessListResponse>> => {
     // Validate the contract id.
    assert.is_hash(vmid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/vm/${vmid}/commits`
    // Return the response.
    return client.fetcher<WitnessListResponse>({ url })
  }
}

export default function (client : EscrowClient) {
  return {
    commits : list_commits_api(client),
    list    : list_machines_api(client),
    read    : read_vm_state_api(client),
    submit  : submit_witness_api(client)
  }
}
