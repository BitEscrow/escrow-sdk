import { assert }                 from '@/core/util/index.js'
import { EscrowClient }           from '@/client/class/client.js'
import { verify_witness_commit } from '@/core/validation/witness.js'

import {
  ApiResponse,
  WitnessDataResponse
} from '@/client/types/index.js'

import {
  MachineData,
  WitnessData,
  WitnessCommit
} from '@/core/types/index.js'

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

export function verify_commit_api (client : EscrowClient) {
  return (
    commit : WitnessCommit,
    vmdata  : MachineData,
    witness : WitnessData
  ) => {
    client.verify_pk(commit.agent_pk)
    verify_witness_commit(commit, vmdata, witness)
  }
}

export default function (client : EscrowClient) {
  return {
    read   : read_witness_api(client),
    verify : verify_commit_api(client)
  }
}
