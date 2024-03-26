import { EscrowClient } from '../../class/client.js'

import {
  ServerKeysResponse,
  ServerPolicyResponse,
  ServerStatusResponse
} from '@/core/types/api/server.js'

import {
  ApiResponse
} from '@/core/types/index.js'

function server_keys_api (client : EscrowClient) {
  return async () : Promise<ApiResponse<ServerKeysResponse>> => {
    // Formulate the request.
    const url = `${client.host}/api/server/keys`
    // Return a response.
    return client.fetcher<ServerKeysResponse>({ url })
  }
}

function server_policy_api (client : EscrowClient) {
  return async () : Promise<ApiResponse<ServerPolicyResponse>> => {
    // Formulate the request.
    const url = `${client.host}/api/server/policy`
    // Return a response.
    return client.fetcher<ServerPolicyResponse>({ url })
  }
}

function server_status_api (client : EscrowClient) {
  return async () : Promise<ApiResponse<ServerStatusResponse>> => {
    // Formulate the request.
    const url = `${client.host}/api/server/status`
    // Return a response.
    return client.fetcher<ServerStatusResponse>({ url })
  }
}

export default function (client : EscrowClient) {
  return {
    keys   : server_keys_api(client),
    policy : server_policy_api(client),
    status : server_status_api(client)
  }
}
