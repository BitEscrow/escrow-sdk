
import { EscrowClient }          from '../class/client.js'
import { validate_register_req } from '@/validators/index.js'

import {
  CovenantData,
  ReturnData,
  ApiResponse,
  AccountRequest,
  AccountDataResponse,
  DepositDataResponse,
  DepositListResponse,
  FundingDataResponse,
  RegisterRequest
} from '@/types/index.js'

import * as assert from '@/assert.js'

/**
 * Request a deposit account from the provider.
 */
function request_account_api (client : EscrowClient) {
  return async (
    request : AccountRequest
  ) : Promise<ApiResponse<AccountDataResponse>> => {
    // Formulate the request.
    const url = `${client.host}/api/deposit/request`
    // Formulate the request.
    const init = {
      method  : 'POST',
      body    : JSON.stringify(request),
      headers : { 'content-type' : 'application/json' }
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
    const url = `${client.host}/api/deposit/register`
    // Formulate the request.
    const init = {
      method  : 'POST',
      body    : JSON.stringify(request),
      headers : { 'content-type' : 'application/json' }
    }
    // Return the response.
    return client.fetcher<DepositDataResponse>({ url, init })
  }
}

/**
 * Fund a contract directly using a deposit template.
 */
function register_funds_api (client : EscrowClient) {
  return async (
    request : RegisterRequest
  ) : Promise<ApiResponse<FundingDataResponse>> => {
    // Assert that a covenant is defined.
    assert.ok(request.covenant !== undefined, 'covenant is undefined')
    // Validate the request.
    validate_register_req(request)
    // Formulate the request url.
    const url  = `${client.host}/api/deposit/register`
    // Forulate the request body.
    const init = {
      method  : 'POST',
      body    : JSON.stringify(request),
      headers : { 'content-type' : 'application/json' }
    }
    // Return the response.
    return client.fetcher<FundingDataResponse>({ url, init })
  }
}

/**
 * 
 */
function read_deposit_api (client : EscrowClient) {
  return async (
    dpid  : string
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    // Validate the deposit id.
    assert.is_hash(dpid)
    // Formulate the request.
    const url = `${client.host}/api/deposit/${dpid}`
    // Return the response.
    return client.fetcher<DepositDataResponse>({ url })
  }
}

function list_deposit_api (client : EscrowClient) {
  return async (
    pubkey : string,
    token  : string
  ) : Promise<ApiResponse<DepositListResponse>> => {
    // Formulate the request.
    const url = `${client.host}/api/deposit/list/${pubkey}`
    // Return the response.
    return client.fetcher<DepositListResponse>({ url, token })
  }
}

function commit_funds_api (client : EscrowClient) {
  return async (
    dpid     : string,
    covenant : CovenantData
  ) : Promise<ApiResponse<FundingDataResponse>> => {
    const url    = `${client.host}/api/deposit/${dpid}/commit`
    const body   = JSON.stringify(covenant)
    const init   = {
      body,
      method  : 'POST',
      headers : { 'content-type' : 'application/json' }
    }
    return client.fetcher<FundingDataResponse>({ url, init })
  }
}

function close_deposit_api (client : EscrowClient) {
  return async (
    req : ReturnData
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    const dpid = req.dpid
    const url  = `${client._host}/api/deposit/${dpid}/close`
    const body = JSON.stringify(req)
    const init = {
      body,
      headers : { 'content-type': 'application/json' },
      method  : 'POST'
    }
    return client.fetcher<DepositDataResponse>({ url, init })
  }
}

export default function (client : EscrowClient) {
  return {
    read     : read_deposit_api(client),
    list     : list_deposit_api(client),
    commit   : commit_funds_api(client),
    fund     : register_funds_api(client),
    register : register_deposit_api(client),
    request  : request_account_api(client),
    close    : close_deposit_api(client)
  }
}
