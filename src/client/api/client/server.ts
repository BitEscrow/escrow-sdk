import { EscrowClient } from '@/client/class/client.js'

import {
  ApiResponse,
  ServerKeysResponse,
  ServerPolicyResponse,
  ServerStatusResponse
} from '@/types/index.js'

function server_keys_api (client : EscrowClient) {
  return async () : Promise<ApiResponse<ServerKeysResponse>> => {
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/server/keys`
    // Return a response.
    return client.fetcher.json<ServerKeysResponse>(url)
  }
}

function server_policy_api (client : EscrowClient) {
  return async () : Promise<ApiResponse<ServerPolicyResponse>> => {
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/server/policy`
    // Return a response.
    return client.fetcher.json<ServerPolicyResponse>(url)
  }
}

function server_status_api (client : EscrowClient) {
  return async () : Promise<ApiResponse<ServerStatusResponse>> => {
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/server/status`
    // Return a response.
    return client.fetcher.json<ServerStatusResponse>(url)
  }
}

export default function (client : EscrowClient) {
  return {
    keys   : server_keys_api(client),
    policy : server_policy_api(client),
    status : server_status_api(client)
  }
}
