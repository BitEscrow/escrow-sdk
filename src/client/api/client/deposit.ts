import { assert } from '@/core/util/index.js'

import {
  validate_account_req,
  validate_register_req,
  validate_close_req,
  validate_lock_req
} from '@/core/validation/index.js'

import {
  ApiResponse,
  AccountRequest,
  AccountDataResponse,
  DepositDataResponse,
  DepositListResponse,
  FundingDataResponse,
  RegisterRequest,
  CloseRequest,
  LockRequest
} from '@/core/types/index.js'

/* Module Imports */

import { EscrowClient } from '../../class/client.js'

/**
 * Request a deposit account from the provider.
 */
function request_account_api (client : EscrowClient) {
  return async (
    request : AccountRequest
  ) : Promise<ApiResponse<AccountDataResponse>> => {
    validate_account_req(request)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/deposit/request`
    // Formulate the request.
    const init = {
      method  : 'POST',
      body    : JSON.stringify(request),
      headers : { 'content-type': 'application/json' }
    }
    // Return the response.
    return client.fetcher<AccountDataResponse>({ url, init })
  }
}

/**
 * Create a deposit account from a template.
 */
function register_deposit_api (client : EscrowClient) {
  return async (
    request : RegisterRequest
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    // Validate the request.
    validate_register_req(request)
    // Configure the url.
    const host = client.server_url
    const url  = `${host}/api/deposit/register`
    // Formulate the request.
    const init = {
      method  : 'POST',
      body    : JSON.stringify(request),
      headers : { 'content-type': 'application/json' }
    }
    // Return the response.
    return client.fetcher<DepositDataResponse>({ url, init })
  }
}

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
    pubkey : string,
    token  : string
  ) : Promise<ApiResponse<DepositListResponse>> => {
    // Validate the pubkey.
    assert.is_hash(pubkey)
    // Define the request url.
    const host = client.server_url
    const url  = `${host}/api/deposit/list/${pubkey}`
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
    dpid    : string,
    request : LockRequest
  ) : Promise<ApiResponse<FundingDataResponse>> => {
    // Validate the deposit id.
    assert.is_hash(dpid)
    // Validate the request body.
    validate_lock_req(request)
    // Create the request url.
    const host = client.server_url
    const url  = `${host}/api/deposit/${dpid}/lock`
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

function close_deposit_api (client : EscrowClient) {
  return async (
    dpid    : string,
    request : CloseRequest
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    // Validate the deposit id.
    assert.is_hash(dpid)
    // Validate the request body.
    validate_close_req(request)
    // Create the request url.
    const host = client.server_url
    const url  = `${host}/api/deposit/${dpid}/close`
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
    request  : request_account_api(client),
    register : register_deposit_api(client),
    list     : list_deposit_api(client),
    read     : read_deposit_api(client),
    lock     : lock_deposit_api(client),
    close    : close_deposit_api(client)
  }
}
