import { assert }                from '@/core/util/index.js'
import { EscrowClient }          from '@/client/class/client.js'
import { verify_witness_commit } from '@/core/validation/witness.js'

import {
  ApiResponse,
  WitnessDataResponse,
  WitnessListResponse
} from '@/client/types/index.js'

import {
  MachineData,
  WitnessInput,
  WitnessData
} from '@/core/types/index.js'

/**
 * Returns a list of witness statements that
 * are associated with the token pubkey.
 */
function list_witness_api (client : EscrowClient) {
  return async (
    token  : string
  ) : Promise<ApiResponse<WitnessListResponse>> => {
    // Define the request url.
    const host = client.server_url
    const url  = `${host}/api/witness/list`
    // Define the request config.
    const init = {
      method  : 'GET',
      headers : { Authorization: 'Bearer ' + token }
    }
    // Return the response.
    return client.fetcher.json<WitnessListResponse>(url, init)
  }
}

/**
 * Returns a specific witness statements matching
 * the provided the statement id (wid).
 */
function read_witness_api (client : EscrowClient) {
  return async (
    wid : string
  ) : Promise<ApiResponse<WitnessDataResponse>> => {
    // Validate the input.
    assert.is_hash(wid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/witness/${wid}`
    // Return a response.
    return client.fetcher.json<WitnessDataResponse>(url)
  }
}

/**
 * Verify a statement from the server was correctly
 * committed to the virtual machine.
 */
function verify_commit_api (client : EscrowClient) {
  return (
    commit  : WitnessData,
    vmstate : MachineData,
    witness : WitnessInput
  ) => {
    // Verify the server pubkey.
    client.verify_pk(commit.agent_pk)
    // Verify the witness statement.
    verify_witness_commit(commit, vmstate, witness)
  }
}

export default function (client : EscrowClient) {
  return {
    list   : list_witness_api(client),
    read   : read_witness_api(client),
    verify : verify_commit_api(client)
  }
}
