/* Global Imports */

import { parse_addr }  from '@scrow/tapscript/address'

/* Module Imports */

import { exists }                from './base.js'
import { fetcher, resolve_json } from './fetch.js'

/* Local Imports */

import {
  ApiResponse,
  OracleFeeEstimate,
  OracleQuery,
  OracleSpendData,
  OracleSpendState,
  OracleTxData,
  OracleUtxo
} from '../types/index.js'

import CoreSchema from '../schema/index.js'

/**
 * Fetch transaction data from the oracle.
 */
export async function get_tx_data (
  host : string,
  txid : string
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
  const parsed = await CoreSchema.oracle.txdata.spa(json.data)
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
  const parsed = await CoreSchema.oracle.txostate.spa(json.data)
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

export async function get_address_utxos (
  host : string,
  addr : string
) : Promise<OracleSpendData[]> {
  // Define the url to use for fetching.
  const url = `${host}/api/address/${addr}/utxo`
  // Fetch a response from the oracle.
  const res = await fetcher<OracleUtxo[]>(url)
  // If response failed, throw error.
  if (!res.ok) throw new Error(res.error)
  // Parse the returned data.
  const parsed = await CoreSchema.oracle.utxo.array().spa(res.data)
  // If data fails validation, throw.
  if (!parsed.success) throw new Error(parsed.error.toString())
  // Return the parsed data.
  return parsed.data.map(({ txid, status, value, vout }) => {
    const scriptkey = parse_addr(addr).hex
    const state     = { spent: false as const }
    const txspend   = { txid, vout, value, scriptkey }
    return { state, status, txspend }
  })
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
    headers : { 'content-type': 'text/plain' },
    method  : 'POST'
  }
  // Fetch a response from the oracle.
  const res = await fetch(url, req)
  // Unpack response object.
  const { status, statusText } = res
  // Return a data object based on the oracle response.
  return (res.ok)
    ? { status, ok: true,  data: await res.text() }
    : { status, ok: false, error: statusText }
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
  // Return the parsed data with rounded values.
  const ent = Object.entries(json.data)
  const rnd = ent.map(([ k, v ]) => [ k, Math.ceil(v) ])
  return Object.fromEntries(rnd)
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
    throw new Error('No quote available for fee target: ' + index)
  }
  // Else, return feerate from oracle.
  return feerate
}
