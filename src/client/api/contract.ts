import { EscrowClient } from '../index.js'
import { WitnessData }  from '@/types/index.js'

import {
  validate_proposal,
  validate_registration,
  verify_proposal
} from '../../validators/index.js'

import {
  ContractDataResponse,
  ContractListResponse,
  DepositListResponse,
  FundingDataResponse,
  WitnessListResponse,
} from '@/client/types.js'

import * as assert from '@/assert.js'

/**
 * Create a contract from a proposal document.
 */
function create_contract_api (
  client : EscrowClient
) {
  return async (
    proposal : Record<string, any>
  ) : Promise<ContractDataResponse> => {
    // Validate the proposal's format.
    validate_proposal(proposal)
    // Verify the proposal's terms.
    verify_proposal(proposal)
    // Formulate the request url.
    const url  = `${client.host}/api/contract/create`
    // Formulate the request body.
    const init = {
      body    : JSON.stringify(proposal),
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
  ) : Promise<ContractDataResponse> => {
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
function list_contract_api (
  client : EscrowClient
) {
  return async (token : string) : Promise<ContractListResponse> => {
    // Formulate the request.
    const url = `${client.host}/api/contract/list`
    // Return the response.
    return client.fetcher<ContractListResponse>({ url, token })
  }
}

/**
 * Return a list of committed deposits
 * that are associated with the contract.
 */
function list_funds_api (client : EscrowClient) {
  return async (cid : string) : Promise<DepositListResponse> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const url = `${client.host}/api/contract/funds`
    // Return the response.
    return client.fetcher<DepositListResponse>({ url })
  }
}

/**
 * Return a list of verified witnesses 
 * that are associated with the contract.
 */
function list_witness_api (client : EscrowClient) {
  return async (cid : string) : Promise<WitnessListResponse> => {
     // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const url = `${client.host}/api/contract/witness`
    // Return the response.
    return client.fetcher<WitnessListResponse>({ url })
  }
}

/**
 * Fund a contract directly using a deposit template.
 */
function fund_contract_api (client : EscrowClient) {
  return async (
    agent_id  : string,
    user_id   : string,
    return_tx : string,
    covenant ?: string
  ) : Promise<FundingDataResponse> => {
    // Assert that a covenant is defined.
    assert.ok(covenant !== undefined, 'covenant is undefined')
    // Create a deposit template.
    const templ = { agent_id, user_id, return_tx, covenant }
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
 * Check and update the status of a contract.
 */
function status_contract_api (client : EscrowClient) {
  return async (cid : string) : Promise<ContractDataResponse> => {
    // Validate the contract id.
    assert.is_hash(cid)
    // Formulate the request.
    const url = `${client.host}/api/contract/${cid}/status`
    // Return the response.
    return client.fetcher<ContractDataResponse>({ url })
  }
}

/**
 * Submit a signed statement to the contract.
 */
function submit_witness_api (client : EscrowClient) {
  return async (
    cid     : string,
    witness : WitnessData
  ) : Promise<WitnessListResponse> => {
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
    return client.fetcher<WitnessListResponse>({ url, init })
  }
}

export default function (client : EscrowClient) {
  return {
    // cancel  : cancel_contract_api(client),
    create  : create_contract_api(client),
    deposit : fund_contract_api(client),
    funds   : list_funds_api(client),
    list    : list_contract_api(client),
    read    : read_contract_api(client),
    status  : status_contract_api(client),
    submit  : submit_witness_api(client),
    witness : list_witness_api(client)
  }
}