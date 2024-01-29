import { verify_endorsement } from '@/lib/member.js'
import { get_proposal_id }    from '@/lib/proposal.js'
import { EscrowClient }       from '@/client/class/client.js'
import { parse_proposal }     from '@/lib/parse.js'
import { verify_proposal }    from '@/validators/index.js'

import {
  ApiResponse,
  ContractDataResponse,
  ContractListResponse,
  DepositListResponse,
  WitnessListResponse,
  ProposalData,
  WitnessData
}  from '@/types/index.js'

import * as assert from '@/assert.js'

/**
 * Create a contract from a proposal document.
 */
function create_contract_api (
  client : EscrowClient
) {
  return async (
    proposal    : ProposalData,
    signatures ?: string[]
  ) : Promise<ApiResponse<ContractDataResponse>> => {
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
      body    : JSON.stringify({ proposal, signatures }),
      method  : 'POST',
      headers : { 'content-type' : 'application/json' }
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
      method  : 'POST',
      body    : token,
      headers : { 'content-type' : 'text/plain' }
    }
    // Return the response.
    return client.fetcher<ContractListResponse>({ url, init })
  }
}

/**
 * Return a list of committed deposits
 * that are associated with the contract.
 */
function list_funds_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<ApiResponse<DepositListResponse>> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const url = `${client.host}/api/contract/${cid}/funds`
    // Return the response.
    return client.fetcher<DepositListResponse>({ url })
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
// function cancel_contract_api (
//   client : EscrowClient
// ) {
//   return async (
//     cid    : string,
//     signer : SignerAPI = client.signer
//   ) : Promise<ContractDataResponse> => {
//     // Validate the contract id.
//     assert.is_hash(cid)
//     // Formulate the request.
//     const url    = `${client.host}/api/contract/${cid}/cancel`
//     // Return the response.
//     return client.fetcher<ContractDataResponse>({ url, signer })
//   }
// }

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
      headers : { 'content-type' : 'application/json' }
    }
    // Return the response.
    return client.fetcher<ContractDataResponse>({ url, init })
  }
}

export default function (client : EscrowClient) {
  return {
    // cancel  : cancel_contract_api(client),
    create  : create_contract_api(client),
    funds   : list_funds_api(client),
    list    : list_contract_api(client),
    read    : read_contract_api(client),
    submit  : submit_witness_api(client),
    witness : list_witness_api(client)
  }
}
