
import { EscrowClient }          from '../class/client.js'
import { validate_registration } from '@/validators/index.js'

import {
  AccountDataResponse,
  DepositDataResponse,
  DepositListResponse,
  FundingDataResponse
} from '@/client/types.js'

import {
  DepositRegister,
  CovenantData,
  ReturnData,
  ApiResponse,
  DepositRequest
} from '@/types/index.js'

import * as assert from '@/assert.js'

/**
 * Request a deposit account from the provider.
 */
function request_deposit_api (client : EscrowClient) {
  return async (
    req : DepositRequest
  ) : Promise<ApiResponse<AccountDataResponse>> => {
    // Ensure params are string values.
    const arr = Object.entries(req)
    // Build a query string with params.
    const qry = new URLSearchParams(arr).toString()
    // Formulate the request.
    const url = `${client.host}/api/deposit/request?${qry}`
    // Return the response.
    return client.fetcher<AccountDataResponse>({ url })
  }
}

/**
 * Create a deposit account from a template.
 */
function register_deposit_api (client : EscrowClient) {
  return async (
    template : DepositRegister
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    // Validate the deposit template.
    validate_registration(template)
    // Configure the url.
    const url = `${client.host}/api/deposit/register`
    // Formulate the request.
    const init = {
      method  : 'POST', 
      body    : JSON.stringify(template),
      headers : { 'content-type' : 'application/json' }
    }
    // Return the response.
    return client.fetcher<DepositDataResponse>({ url, init })
  }
}

/**
 * 
 */
function read_deposit_api (client : EscrowClient) {
  return async (
    dpid  : string,
    token : string
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    // Validate the deposit id.
    assert.is_hash(dpid)
    // Formulate the request.
    const url = `${client.host}/api/deposit/${dpid}`
    // Return the response.
    return client.fetcher<DepositDataResponse>({ url, token })
  }
}

function list_deposit_api (client : EscrowClient) {
  return async (
    token : string
  ) : Promise<ApiResponse<DepositListResponse>> => {
    // Formulate the request.
    const url = `${client.host}/api/deposit/list`
    // Return the response.
    return client.fetcher<DepositListResponse>({ url, token })
  }
}

function commit_deposit_api (client : EscrowClient) {
  return async (
    dpid     : string,
    covenant : CovenantData,
    token    : string
  ) : Promise<ApiResponse<FundingDataResponse>> => {
    const url    = `${client.host}/api/deposit/${dpid}/add`
    const body   = JSON.stringify(covenant)
    const init   = {
      body,
      method  : 'POST',
      headers : { 'content-type' : 'application/json' }
    }
    return client.fetcher<FundingDataResponse>({ url, init, token })
  }
}

function close_deposit_api (client : EscrowClient) {
  return async (
    req   : ReturnData,
    token : string
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    const dpid = req.dpid
    const url  = `${client._host}/api/deposit/${dpid}/close`
    const body = JSON.stringify(req)
    const init = {
      body,
      headers : { 'content-type': 'application/json' },
      method  : 'POST'
    }
    return client.fetcher<DepositDataResponse>({ url, init, token })
  }
}

function status_deposit_api (client : EscrowClient) {
  return async (
    dpid : string
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    assert.is_hash(dpid)
    const url = `${client.host}/api/deposit/${dpid}/status`
    return client.fetcher<DepositDataResponse>({ url })
  }
}

export default function (client : EscrowClient) {
  return {
    close    : close_deposit_api(client),
    commit   : commit_deposit_api(client),
    list     : list_deposit_api(client),
    read     : read_deposit_api(client),
    register : register_deposit_api(client),
    request  : request_deposit_api(client),
    status   : status_deposit_api(client),
  }
}
