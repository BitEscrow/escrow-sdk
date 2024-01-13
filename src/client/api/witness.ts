import EscrowClient from '../class/client.js'

import {
  WitnessData,
} from '../../types/index.js'

import * as assert from '@/assert.js'

function read_witness_api (client : EscrowClient) {
  return async (
    wid : string
  ) : Promise<WitnessData> => {
    // Validate witness id.
    assert.is_hash(wid)
    // Formulate the request.
    const url = `${client.host}/api/witness/${wid}`
    return client.fetcher<WitnessData>({ url })
  }
}

export default function (client : EscrowClient) {
  return {
    read : read_witness_api(client)
  }
}