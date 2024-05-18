import { assert } from '@/core/util/index.js'

import {
  validate_close_req,
  validate_lock_req
} from '@/core/validation/index.js'

import {
  ApiResponse,
  DepositDataResponse,
  DepositListResponse,
  FundingDataResponse,
  CloseRequest,
  LockRequest
} from '@/core/types/index.js'

/* Module Imports */

import { EscrowClient } from '../../class/client.js'

/**
 * Fetch a deposit from the server by Id.
 */
function read_deposit_api (client : EscrowClient) {
  return async (
    dpid  : string
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    // Validate the deposit id.
    assert.is_hash(dpid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/deposit/${dpid}`
    // Return the response.
    return client.fetcher<DepositDataResponse>({ url })
  }
}

function list_deposit_api (client : EscrowClient) {
  return async (
    token  : string
  ) : Promise<ApiResponse<DepositListResponse>> => {
    // Define the request url.
    const host = client.server_url
    const url  = `${host}/api/deposit/list`
    // Define the request config.
    const init = {
      method  : 'GET',
      headers : { Authorization: 'Bearer ' + token }
    }
    // Return the response.
    return client.fetcher<DepositListResponse>({ url, init })
  }
}

function lock_deposit_api (client : EscrowClient) {
  return async (
    request : LockRequest
  ) : Promise<ApiResponse<FundingDataResponse>> => {
    // Validate the request body.
    validate_lock_req(request)
    // Create the request url.
    const host = client.server_url
    const url  = `${host}/api/deposit/${request.dpid}/lock`
    // Create the request object.
    const init   = {
      body    : JSON.stringify(request),
      method  : 'POST',
      headers : { 'content-type': 'application/json' }
    }
    // Fetch and return a response.
    return client.fetcher<FundingDataResponse>({ url, init })
  }
}

function cancel_deposit_api (client : EscrowClient) {
  return async (
    dpid  : string,
    token : string
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    // Validate the deposit id.
    assert.is_hash(dpid)
    // Create the request url.
    const host = client.server_url
    const url  = `${host}/api/deposit/${dpid}/cancel`
    // Create the request object.
    const init = {
      method  : 'GET',
      headers : { Authorization: 'Bearer ' + token }
    }
    return client.fetcher<DepositDataResponse>({ url, init })
  }
}

function close_deposit_api (client : EscrowClient) {
  return async (
    request : CloseRequest
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    // Validate the request body.
    validate_close_req(request)
    // Create the request url.
    const host = client.server_url
    const url  = `${host}/api/deposit/${request.dpid}/close`
    // Create the request object.
    const init = {
      body    : JSON.stringify(request),
      headers : { 'content-type': 'application/json' },
      method  : 'POST'
    }
    return client.fetcher<DepositDataResponse>({ url, init })
  }
}

export default function (client : EscrowClient) {
  return {
    list   : list_deposit_api(client),
    read   : read_deposit_api(client),
    lock   : lock_deposit_api(client),
    cancel : cancel_deposit_api(client),
    close  : close_deposit_api(client)
  }
}
