
import { EscrowClient }          from '../class/client.js'
import { validate_registration } from '@/validators/index.js'

import {
  AccountDataResponse,
  DepositDataResponse,
  DepositListResponse,
  FundingDataResponse
} from '@/client/types.js'

import {
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
    agent_id  : string,
    return_tx : string 
  ) : Promise<ApiResponse<DepositDataResponse>> => {
    // Create template
    const tmpl = { agent_id, return_tx }
    // Validate the deposit template.
    validate_registration({ agent_id, return_tx })
    // Configure the url.
    const url = `${client.host}/api/deposit/register`
    // Formulate the request.
    const init = {
      method  : 'POST',
      body    : JSON.stringify(tmpl),
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
    agent_id  : string,
    return_tx : string,
    covenant  : CovenantData
  ) : Promise<ApiResponse<FundingDataResponse>> => {
    // Assert that a covenant is defined.
    assert.ok(covenant !== undefined, 'covenant is undefined')
    // Create a deposit template.
    const templ = { agent_id, return_tx, covenant }
    // Validate the deposit template.
    validate_registration(templ)
    // Formulate the request url.
    const url  = `${client.host}/api/deposit/register`
    // Forulate the request body.
    const init = {
      method  : 'POST', 
      body    : JSON.stringify(templ),
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
    token : string
  ) : Promise<ApiResponse<DepositListResponse>> => {
    // Formulate the request.
    const url = `${client.host}/api/deposit/list`
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
    request  : request_deposit_api(client),
    close    : close_deposit_api(client)
  }
}
