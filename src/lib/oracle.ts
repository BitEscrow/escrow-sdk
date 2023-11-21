import { exists } from './util.js'

import {
  OracleFeeEstimate,
  OracleQuery,
  OracleSpendData,
  OracleSpendState,
  OracleTxData,
  Resolve
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
  // Resolve the data received by the oracle.
  const ret = await resolve<OracleTxData>(res)
  // If the resolution is not ok, throw an error.
  if (!ret.ok) throw new Error(ret.error)
  // Validate the oracle data.
  await schema.oracle.txdata.parseAsync(ret.data)
  // Return the oracle data.
  return ret.data
}

/**
 * Fetch the spending state of a transaction
 * output from the oracle.
 */
export async function get_spend_state (
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
  // Resolve the data received by the oracle.
  const ret = await resolve<OracleSpendState>(res)
  // If the resolution is not ok, throw an error.
  if (!ret.ok) throw new Error(ret.error)
  // Validate the oracle data.
  await schema.oracle.txostate.parseAsync(ret.data)
  // Return the oracle data.
  return ret.data
}

/**
 * Fetch the full status and state of a
 * transaction output from the oracle.
 */
export async function get_spend_data (
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
  const state = await get_spend_state(host, txid, idx)
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
) : Promise<Resolve<string>> {
  // Define the url to use for fetching.
  const url = `${host}/api/tx`
  // Fetch a response from the oracle.
  const res = await fetch(url, {
    body    : txhex,
    headers : { 'content-type' : 'text/plain' },
    method  : 'POST'
  })
  // Return a data object based on the oracle response.
  return (res.ok) 
    ? { ok : true,  data  : await res.text() }
    : { ok : false, error : `${res.status} : ${res.statusText}` }
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
  // Resolve the data received by the oracle.
  const ret = await resolve<OracleFeeEstimate>(res)
  // If the resolution is not ok, throw an error.
  if (!ret.ok) throw new Error(ret.error)
  // Return the fee data.
  return ret.data
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

/**
 * Helper method for resolving json
 * and other data from HTTP responses.
 */
export async function resolve <T> (
  res : Response
) : Promise<Resolve<T>> {
  try {
    const json = await res.json()
    return res.ok
      ? { ok : true,  data  : json as T  }
      : { ok : false, error : json.error }
  } catch {
    return { ok : false, error : `${res.status}: ${res.statusText}` }
  }
}
