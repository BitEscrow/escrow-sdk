/* Module Imports */

import * as assert        from '@/assert.js'
import { parse_proposal } from '@/core/lib/parse.js'

import {
  ApiResponse,
  ServerPolicy
} from '@/types.js'

import {
  verify_endorsements,
  verify_proposal
} from '@/core/validators/index.js'

import {
  ContractDataResponse,
  ContractListResponse,
  FundListResponse,
  ContractDigestResponse,
  ContractStatusResponse,
  ContractRequest
} from '@/core/types/index.js'

/* Local Imports */

import { EscrowClient } from '@/client/class/client.js'

/**
 * Create a contract from a proposal document.
 */
function create_contract_api (
  client : EscrowClient
) {
  return async (
    request : ContractRequest,
    policy ?: ServerPolicy
  ) : Promise<ApiResponse<ContractDataResponse>> => {
    const { proposal, signatures } = request
    // Parse and validate the proposal.
    const prop = parse_proposal(proposal)
    // Verify the proposal's terms.
    verify_proposal(prop, policy)
    // Verify any signatures.
    verify_endorsements(prop, signatures)
    // Formulate the request url.
    const host = client.server_url
    const url  = `${host}/api/contract/create`
    // Formulate the request body.
    const init = {
      body    : JSON.stringify(request),
      method  : 'POST',
      headers : { 'content-type': 'application/json' }
    }
    // Return the response.
    return client.fetcher<ContractDataResponse>({ url, init })
  }
}

/**
 * Fetch and return a contract by its identifier.
 */
function read_contract_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<ApiResponse<ContractDataResponse>> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/contract/${cid}`
    // Return the response.
    return client.fetcher<ContractDataResponse>({ url })
  }
}

/**
 * Return a list of committed deposits
 * that are associated with the contract.
 */
function read_contract_digest_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<ApiResponse<ContractDigestResponse>> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/contract/${cid}/digest`
    // Return the response.
    return client.fetcher<ContractDigestResponse>({ url })
  }
}

/**
 * Return a list of committed deposits
 * that are associated with the contract.
 */
function read_contract_status_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<ApiResponse<ContractStatusResponse>> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/contract/${cid}/status`
    // Return the response.
    return client.fetcher<ContractStatusResponse>({ url })
  }
}

/**
 * Return a list of contracts that
 * are associated with a given pubkey.
 */
function list_contract_api (client : EscrowClient) {
  return async (
    pubkey : string,
    token  : string
  ) : Promise<ApiResponse<ContractListResponse>> => {
    // Define the request url.
    const host = client.server_url
    const url  = `${host}/api/contract/list/${pubkey}`
    // Define the request config.
    const init = {
      method  : 'GET',
      headers : { Authorization: 'Bearer ' + token }
    }
    // Return the response.
    return client.fetcher<ContractListResponse>({ url, init })
  }
}

/**
 * Return a list of committed funds
 * that are locked to the contract.
 */
function list_funds_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<ApiResponse<FundListResponse>> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/contract/${cid}/funds`
    // Return the response.
    return client.fetcher<FundListResponse>({ url })
  }
}

/**
 * Cancel a contract that is not active.
 */
function cancel_contract_api (
  client : EscrowClient
) {
  return async (
    cid   : string,
    token : string
  ) => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const host = client.server_url
    const url  = `${host}/api/contract/${cid}/cancel`
    // Define the request config.
    const init = {
      method  : 'GET',
      headers : { Authorization: 'Bearer ' + token }
    }
    // Return the response.
    return client.fetcher<ContractDataResponse>({ url, init })
  }
}

export default function (client : EscrowClient) {
  return {
    cancel : cancel_contract_api(client),
    create : create_contract_api(client),
    digest : read_contract_digest_api(client),
    funds  : list_funds_api(client),
    list   : list_contract_api(client),
    read   : read_contract_api(client),
    status : read_contract_status_api(client)
  }
}
