import { EscrowClient } from '../class/client.js'

import {
  ApiResponse,
  WitnessData,
} from '../../types/index.js'

import * as assert from '@/assert.js'

function read_witness_api (client : EscrowClient) {
  return async (
    wid : string
  ) : Promise<ApiResponse<WitnessData>> => {
    // Validate witness id.
    assert.is_hash(wid)
    // Formulate the request.
    const url = `${client.host}/api/witness/${wid}`
    // Return a response.
    return client.fetcher<WitnessData>({ url })
  }
}

export default function (client : EscrowClient) {
  return {
    read : read_witness_api(client)
  }
}