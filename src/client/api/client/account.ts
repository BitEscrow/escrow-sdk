/* Global Imports */

import {
  validate_account_req,
  validate_register_req,
  validate_commit_req
} from '@/core/validation/index.js'

import {
  ApiResponse,
  AccountRequest,
  AccountDataResponse,
  DepositDataResponse,
  FundingDataResponse,
  RegisterRequest,
  CommitRequest
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
    const url  = `${host}/api/account/request`
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
    const url  = `${host}/api/account/register`
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
 * Fund a contract directly using a deposit template.
 */
function commit_funds_api (client : EscrowClient) {
  return async (
    request : CommitRequest
  ) : Promise<ApiResponse<FundingDataResponse>> => {
    // Validate the request.
    validate_commit_req(request)
    // Formulate the request url.
    const host = client.server_url
    const url  = `${host}/api/account/commit`
    // Forulate the request body.
    const init = {
      method  : 'POST',
      body    : JSON.stringify(request),
      headers : { 'content-type': 'application/json' }
    }
    // Return the response.
    return client.fetcher<FundingDataResponse>({ url, init })
  }
}

export default function (client : EscrowClient) {
  return {
    commit   : commit_funds_api(client),
    register : register_deposit_api(client),
    request  : request_account_api(client)
  }
}
