import { exists } from './util.js'

import {
  ApiResponse,
  OracleFeeEstimate,
  OracleQuery,
  OracleSpendData,
  OracleSpendState,
  OracleTxData
} from '../types/index.js'

import * as schema from '@/schema/index.js'

/**
 * Fetch transaction data from the oracle.
 */
export async function get_tx_data (
  host : string,
  txid : string,
) : Promise<OracleTxData | null> {
  // Define the url to use for fetching.
  const url = `${host}/api/tx/${txid}`
  // Fetch a response from the oracle.
  const res = await fetch(url)
  // If status is 404, return null.
  if (res.status === 404) return null
  // Resolve the response into json.
  const json = await resolve_json<OracleTxData>(res)
  // If the response failed, throw.
  if (!json.ok) throw new Error(json.error)
  // Parse the returned data.
  const parsed = await schema.oracle.txdata.spa(json.data)
  // If data fails validation, throw.
  if (!parsed.success) throw new Error(parsed.error.toString())
  // Return the parsed data.
  return parsed.data
}

/**
 * Fetch the spending state of a transaction
 * output from the oracle.
 */
export async function get_utxo_state (
  host : string,
  txid : string,
  vout : number
) : Promise<OracleSpendState | null> {
  // Define the url to use for fetching.
  const url = `${host}/api/tx/${txid}/outspend/${vout}`
  // Fetch a response from the oracle.
  const res = await fetch(url)
  // If status is 404, return null.
  if (res.status === 404) return null
  // Resolve the response into json.
  const json = await resolve_json<OracleSpendState>(res)
  // If the response failed, throw.
  if (!json.ok) throw new Error(json.error)
  // Parse the returned data.
  const parsed = await schema.oracle.txostate.spa(json.data)
  // If data fails validation, throw.
  if (!parsed.success) throw new Error(parsed.error.toString())
  // Return the parsed data.
  return parsed.data
}

/**
 * Fetch the full status and state of a
 * transaction output from the oracle.
 */
export async function get_utxo_data (
  host  : string,
  query : OracleQuery
) : Promise<OracleSpendData | null> {
  // Unpack the query object.
  const { txid, vout, address } = query
  // Fetch transaction data from the oracle.
  const tx = await get_tx_data(host, txid)
  // If the transaction is null, return null.
  if (tx === null) return null
  // Define an index variable.
  let idx : number
  // Search the transaction outputs (via address or index).
  if (!exists(vout)) {
    if (!exists(address)) {
      throw new Error('You must specify an address or vout!')
    }
    idx = tx.vout.findIndex(e => e.scriptpubkey_address === address)
  } else {
    idx = vout
  }
  // If the index is -1, return null.
  if (idx === -1) return null
  // Set the txout based on the resulting index.
  const txout = tx.vout.at(idx)
  // If txout is undefined, return null.
  if (txout === undefined) return null
  // Get the spend state of the txout from the oracle.
  const state = await get_utxo_state(host, txid, idx)
  // If the spend state is null, return null.
  if (state === null) return null
  // Construct the returned txout.
  const txspend = {
    txid,
    vout      : idx,
    value     : txout.value,
    scriptkey : txout.scriptpubkey
  }
  // Return the txout aling with its state and status.
  return { txspend, status: tx.status, state }
}

/**
 * Broadcast a transaction through the oracle.
 */
export async function broadcast_tx (
  host  : string,
  txhex : string
) : Promise<ApiResponse<string>> {
  // Define the url to use for fetching.
  const url = `${host}/api/tx`
  // Configure the request.
  const req = {
    body    : txhex,
    headers : { 'content-type' : 'text/plain' },
    method  : 'POST'
  }
  // Fetch a response from the oracle.
  const res    = await fetch(url, req)
  const { status, statusText } = res
  // Return a data object based on the oracle response.
  return (res.ok) 
    ? { status, ok : true,  data  : await res.text() }
    : { status, ok : false, error : statusText }
}

/**
 * Fetch a range of fee estimates from the oracle.
 */
export async function fee_estimates (
  host : string
) : Promise<OracleFeeEstimate> {
  // Define the url to use for fetching.
  const url = `${host}/api/fee-estimates`
  // Fetch a response from the oracle.
  const res = await fetch(url)
  // Resolve the response into json.
  const json = await resolve_json<OracleFeeEstimate>(res)
  // If the response failed, throw.
  if (!json.ok) throw new Error(json.error)
  // Return the parsed data.
  return json.data
}

/**
 * Fetch a fee quote from the oracle,
 * based on a target block height.
 */
export async function get_fee_target (
  host   : string,
  target : number
) : Promise<number> {
  // Fetch an array of quotes from the oracle.
  const quotes  = await fee_estimates(host)
  // Convert target height to an index.
  const index   = String(target)
  // Retrieve a specific quote based on index.
  const feerate = quotes[index]
  // If feerate does not exist, throw an error.
  if (typeof feerate !== 'number') {
    throw new Error('No quote available for target: ' + index)
  }
  // Else, return feerate from oracle.
  return feerate
}

export async function fetcher<T> (
  input   : URL | RequestInfo, 
  init   ?: RequestInit,
  fetcher = fetch
) {
  const res = await fetcher(input, init)
  return resolve_json<T>(res)
} 

/**
 * Helper method for resolving json
 * and other data from HTTP responses.
 */
export async function resolve_json <T> (
  res : Response
) : Promise<ApiResponse<T>> {
  const { status, statusText } = res

  let data : any
  
  try {
    data = await res.json()
  } catch {
    data = undefined
  }

  if (!res.ok) {
    const error = (typeof data?.error === 'string')
      ? data.error
      : statusText
    return { status, ok: false, error }
  }

  if (data === undefined) {
    return {
      status,
      ok     : false, 
      error  : 'data is undefined'
    }
  }

  return { status, ok : true, data }
}
