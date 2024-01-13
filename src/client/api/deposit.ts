
import EscrowClient              from '../class/client.js'
import { validate_registration } from '@/validators/index.js'

import {
  DepositRegister,
  Literal,
  CovenantData,
  DepositReturn
} from '@/types/index.js'

import {
  DepositDataResponse,
  DepositInfoResponse,
  DepositListResponse,
  FundingDataResponse
} from '@/client/types.js'

import * as assert from '@/assert.js'

/**
 * Request a deposit account from the provider.
 */
function request_deposit_api (client : EscrowClient) {
  return async (
    params : Record<string, Literal> = {}
  ) : Promise<DepositInfoResponse> => {
    // Ensure params are string values.
    const arr = Object.entries(params).map(([ k, v ]) => [ k, String(v) ])
    // Build a query string with params.
    const qry = new URLSearchParams(arr).toString()
    // Formulate the request.
    const url = `${client.host}/api/deposit/request?${qry}`
    // Return the response.
    return client.fetcher<DepositInfoResponse>({ url })
  }
}

/**
 * Create a deposit template for registration.
 */
// function create_template_api (client : EscrowClient) {
//   return async (
//     deposit  : DepositInfo,
//     txid     : string,
//     options ?: DepositConfig
//   ) => {
//     // Unpack the deposit object.
//     const { agent_id, agent_pk, sequence } = deposit
//     // Unpack the options object.
//     const { cid, network = 'regtest' } = options ?? {}
//     // Define our pubkey.
//     const pub  = client.signer.pubkey
//     // Get the context object for our deposit account.
//     const ctx  = get_deposit_ctx(agent_pk, pub, sequence)
//     // Get the address for our deposit account.
//     const addr = get_deposit_address(ctx, network)
//     // Get the transaction data from our oracle.
//     const odat = await client.oracle.get_spend_out({ txid, address : addr })
//     // Assert the transaction data is valid.
//     assert.ok(odat !== null, 'transaction output not found')
//     // Unpack the transaction output.
//     const utxo = odat.txspend
//     // Create the return transaction.
//     const rtx  = create_return_tx(ctx, client.signer, utxo, options)
//     // Create the deposit template.
//     const tmpl : DepositTemplate = { agent_id, return_tx : rtx }
//     // If a contract id is specified:
//     if (cid !== undefined) {
//       // Fetch the contract via the id.
//       const ct  = await client.contract.read(cid)
//       // Create a covenant with the contract and deposit.
//       const cov = create_spend_psigs(ctx, ct.data, client.signer, utxo)
//       // Attach the covenant to our template.
//       tmpl.covenant = cov
//     }
//     // Return the contract template.
//     return tmpl
//   }
// }

/**
 * Create a deposit account from a template.
 */
function register_deposit_api (client : EscrowClient) {
  return async (
    template : DepositRegister
  ) : Promise<DepositDataResponse> => {
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
  ) : Promise<DepositDataResponse> => {
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
  ) : Promise<DepositListResponse> => {
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
  ) : Promise<FundingDataResponse> => {
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
    req   : DepositReturn,
    token : string
  ) : Promise<DepositDataResponse> => {
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
  ) : Promise<DepositDataResponse> => {
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