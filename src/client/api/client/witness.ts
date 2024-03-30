import { EscrowClient } from '@/client/class/client.js'
import { ApiResponse }  from '@/types.js'

import {
  WitnessDataResponse
} from '@/core/types/index.js'

import * as assert from '@/assert.js'

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

export default function (client : EscrowClient) {
  return {
    read : read_witness_api(client)
  }
}
