/* Module Imports */

import { get_proposal_id }    from '@/core/lib/proposal.js'
import { parse_proposal }     from '@/core/lib/parse.js'
import { verify_proposal }    from '@/core/validators/index.js'

import {
  ApiResponse,
  ContractDataResponse,
  ContractListResponse,
  WitnessListResponse,
  WitnessData,
  FundListResponse,
  ContractDigestResponse,
  ContractVMStateResponse,
  DraftData,
  ContractStatusResponse
} from '@/core/types/index.js'

import * as assert from '@/assert.js'

/* Local Imports */

import { verify_endorsement } from '@/client/lib/member.js'
import { EscrowClient }       from '@/client/class/client.js'

/**
 * Create a contract from a proposal document.
 */
function create_contract_api (
  client : EscrowClient
) {
  return async (
    session : Partial<DraftData>
  ) : Promise<ApiResponse<ContractDataResponse>> => {
    const { members, proposal, signatures } = session
    // Parse and validate the proposal.
    const prop = parse_proposal(proposal)
    // Verify the proposal's terms.
    verify_proposal(prop)
    // Verify any signatures.
    if (signatures !== undefined) {
      const prop_id = get_proposal_id(prop)
      signatures.forEach(e => verify_endorsement(prop_id, e, true))
    }
    // Formulate the request url.
    const url  = `${client.host}/api/contract/create`
    // Formulate the request body.
    const init = {
      body    : JSON.stringify({ members, proposal, signatures }),
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
    const url = `${client.host}/api/contract/${cid}`
    // Return the response.
    return client.fetcher<ContractDataResponse>({ url })
  }
}

/**
 * Return a list of committed deposits
 * that are associated with the contract.
 */
function read_vm_state_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<ApiResponse<ContractVMStateResponse>> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const url = `${client.host}/api/contract/${cid}/vmstate`
    // Return the response.
    return client.fetcher<ContractVMStateResponse>({ url })
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
    const url = `${client.host}/api/contract/${cid}/digest`
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
    const url = `${client.host}/api/contract/${cid}/status`
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
    const url  = `${client.host}/api/contract/list/${pubkey}`
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
    const url = `${client.host}/api/contract/${cid}/funds`
    // Return the response.
    return client.fetcher<FundListResponse>({ url })
  }
}

/**
 * Return a list of verified witnesses
 * that are associated with the contract.
 */
function list_witness_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<ApiResponse<WitnessListResponse>> => {
     // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const url = `${client.host}/api/contract/${cid}/witness`
    // Return the response.
    return client.fetcher<WitnessListResponse>({ url })
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
    const url    = `${client.host}/api/contract/${cid}/cancel`
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
 * Submit a signed statement to the contract.
 */
function submit_witness_api (client : EscrowClient) {
  return async (
    cid     : string,
    witness : WitnessData
  ) : Promise<ApiResponse<ContractDataResponse>> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request url.
    const url  = `${client._host}/api/contract/${cid}/submit`
    // Formulate the request body.
    const init = {
      method  : 'POST',
      body    : JSON.stringify(witness),
      headers : { 'content-type': 'application/json' }
    }
    // Return the response.
    return client.fetcher<ContractDataResponse>({ url, init })
  }
}

export default function (client : EscrowClient) {
  return {
    cancel  : cancel_contract_api(client),
    create  : create_contract_api(client),
    digest  : read_contract_digest_api(client),
    funds   : list_funds_api(client),
    list    : list_contract_api(client),
    read    : read_contract_api(client),
    status  : read_contract_status_api(client),
    submit  : submit_witness_api(client),
    vmstate : read_vm_state_api(client),
    witness : list_witness_api(client)
  }
}
