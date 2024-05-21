import { assert, parser }     from '@/core/util/index.js'
import { create_publish_req } from '@/core/module/contract/index.js'
import { EscrowClient }       from '@/client/class/client.js'
import { DEFAULT_POLICY }     from '@/client/config/index.js'

import {
  verify_contract_session,
  verify_contract_sigs,
  verify_endorsements,
  verify_proposal_data
} from '@/core/validation/index.js'

import {
  ContractRequest,
  ContractSession,
  ProposalPolicy,
  ScriptEngineAPI
} from '@/core/types/index.js'

import {
  ApiResponse,
  ContractDataResponse,
  ContractListResponse,
  FundListResponse
} from '@/client/types/index.js'

/**
 * Create a contract from a proposal document.
 */
function create_contract_api (
  client : EscrowClient
) {
  return async (
    request : ContractRequest,
    engine  : ScriptEngineAPI,
    policy  : ProposalPolicy = DEFAULT_POLICY.proposal
  ) : Promise<ApiResponse<ContractDataResponse>> => {
    // Unpack configurations from client.
    const { endorsements, proposal } = request
    // Parse and validate the proposal.
    const prop = parser.parse_proposal(proposal)
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
    token : string
  ) : Promise<ApiResponse<ContractListResponse>> => {
    // Define the request url.
    const host = client.server_url
    const url  = `${host}/api/contract/list`
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
function cancel_contract_api (client : EscrowClient) {
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

function verify_contract_api (client : EscrowClient) {
  return (session : ContractSession) => {
    const pubkey = client.server_pk
    verify_contract_session(session)
    verify_contract_sigs(session.contract, pubkey)
  }
}

export default function (client : EscrowClient) {
  return {
    cancel : cancel_contract_api(client),
    create : create_contract_api(client),
    funds  : list_funds_api(client),
    list   : list_contract_api(client),
    read   : read_contract_api(client),
    verify : verify_contract_api(client)
  }
}
