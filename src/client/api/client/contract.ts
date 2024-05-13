/* Global Imports */

import { assert, parse_proposal } from '@/core/util/index.js'
import { create_publish_req }     from '@/core/module/contract/index.js'

import {
  validate_commit_req,
  verify_endorsements,
  verify_proposal_data
} from '@/core/validation/index.js'

import {
  ApiResponse,
  ContractDataResponse,
  ContractListResponse,
  FundListResponse,
  ContractRequest,
  FundingDataResponse,
  CommitRequest,
  ServerPolicy,
  ScriptEngineAPI
} from '@/core/types/index.js'

/* Module Imports */

import { EscrowClient } from '../../class/client.js'

/**
 * Create a contract from a proposal document.
 */
function create_contract_api (
  client : EscrowClient
) {
  return async (
    engine  : ScriptEngineAPI,
    policy  : ServerPolicy,
    request : ContractRequest
  ) : Promise<ApiResponse<ContractDataResponse>> => {
    // Unpack configurations from client.
    const { endorsements, proposal } = request
    // Parse and validate the proposal.
    const prop = parse_proposal(proposal)
    // Verify the proposal's terms.
    verify_proposal_data(engine, policy, prop)
    // Verify any signatures.
    verify_endorsements(prop, endorsements)
    // Create a contract publish request.
    const req  = create_publish_req(proposal, endorsements)
    // Formulate the request url.
    const host = client.server_url
    const url  = `${host}/api/contract/create`
    // Formulate the request body.
    const init = {
      body    : JSON.stringify(req),
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
    const url  = `${host}/api/contract/list?pk=${pubkey}`
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
    const cid  = request.covenant.cid
    const host = client.server_url
    const url  = `${host}/api/contract/${cid}/commit`
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
    cancel : cancel_contract_api(client),
    commit : commit_funds_api(client),
    create : create_contract_api(client),
    funds  : list_funds_api(client),
    list   : list_contract_api(client),
    read   : read_contract_api(client)
  }
}
