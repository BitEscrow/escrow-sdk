import { assert }       from '@/core/util/index.js'
import { EscrowClient } from '../../class/client.js'

import {
  ApiResponse,
  WitnessDataResponse
} from '@/client/types/index.js'

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
