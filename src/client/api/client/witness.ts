import { assert } from '@/core/util/index.js'

import {
  ApiResponse,
  WitnessDataResponse,
  WitnessListResponse
} from '@/core/types/index.js'

import { EscrowClient } from '../../class/client.js'

function read_witness_api (client : EscrowClient) {
  return async (
    wid : string
  ) : Promise<ApiResponse<WitnessDataResponse>> => {
    // Validate witness id.
    assert.is_hash(wid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/witness/${wid}`
    // Return a response.
    return client.fetcher<WitnessDataResponse>({ url })
  }
}

function list_statements_api (client : EscrowClient) {
  return async (vmid : string) : Promise<ApiResponse<WitnessListResponse>> => {
     // Validate the contract id.
    assert.is_hash(vmid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/witness/list?vmid=${vmid}`
    // Return the response.
    return client.fetcher<WitnessListResponse>({ url })
  }
}

export default function (client : EscrowClient) {
  return {
    list : list_statements_api(client),
    read : read_witness_api(client)
  }
}
