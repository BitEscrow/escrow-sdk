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

export async function get_tx_data (
  host : string,
  txid : string,
) : Promise<OracleTxData | null> {
  /**
   * Fetch transaction data from the oracle.
   */
  const url = `${host}/api/tx/${txid}`
  const res = await fetch(url)

  if (res.status === 404) return null

  const ret = await resolve<OracleTxData>(res)

  if (!ret.ok) throw new Error(ret.error)

  await schema.oracle.txdata.parseAsync(ret.data)

  return ret.data
}

export async function get_spend_state (
  host : string,
  txid : string,
  vout : number
) : Promise<OracleSpendState | null> {
  /**
   * Fetch the spending state of a transaction
   * output from the oracle.
   */
  const url = `${host}/api/tx/${txid}/outspend/${vout}`
  const res = await fetch(url)

  if (res.status === 404) return null
  
  const ret = await resolve<OracleSpendState>(res)

  if (!ret.ok) throw new Error(ret.error)

  await schema.oracle.txostate.parseAsync(ret.data)

  return ret.data
}

export async function get_spend_data (
  host  : string,
  query : OracleQuery
) : Promise<OracleSpendData | null> {
  /**
   * Fetch the full status and state of a
   * transaction output from the oracle.
   */
  const { txid, vout, address } = query
  
  const tx = await get_tx_data(host, txid)

  if (tx === null) return null

  let idx : number

  if (!exists(vout)) {
    if (!exists(address)) {
      throw new Error('You must specify an address or vout!')
    }
    idx = tx.vout.findIndex(e => e.scriptpubkey_address === address)
  } else {
    idx = vout
  }

  if (idx === -1) return null

  const txout = tx.vout.at(idx)
  
  if (txout === undefined) return null

  const state = await get_spend_state(host, txid, idx)

  if (state === null) return null
  
  const txspend = {
    txid,
    vout      : idx,
    value     : txout.value,
    scriptkey : txout.scriptpubkey
  }

  return { txspend, status: tx.status, state }
}

export async function broadcast_tx (
  host  : string,
  txhex : string
) : Promise<Resolve<string>> {
  /**
   * Broadcast a transaction through the oracle.
   */
  const url = `${host}/api/tx`

  const res = await fetch(url, {
    body    : txhex,
    headers : { 'content-type' : 'text/plain' },
    method  : 'POST'
  })

  return (res.ok) 
    ? { ok : true,  data  : await res.text() }
    : { ok : false, error : `${res.status} : ${res.statusText}` }
}

export async function fee_estimates (
  host : string
) : Promise<OracleFeeEstimate> {
  /**
   * Fetch a range of fee estimates from the oracle.
   */
  const url = `${host}/api/fee-estimates`
  const res = await fetch(url)
  const ret = await resolve<OracleFeeEstimate>(res)
  if (!ret.ok) throw new Error(ret.error)
  return ret.data
}

export async function get_fee_target (
  host   : string,
  target : number
) : Promise<number> {
  /**
   * Fetch a fee quote from the oracle,
   * based on a target block height.
   */
  const quotes  = await fee_estimates(host)
  const index   = String(target)
  const feerate = quotes[index]
  if (typeof feerate !== 'number') {
    throw new Error('No quote available for target: ' + index)
  }
  return feerate
}

export async function resolve <T> (
  res : Response
) : Promise<Resolve<T>> {
  /**
   * Helper method for resolving json
   * and other data from HTTP responses.
   */
  try {
    const json = await res.json()
    return res.ok
      ? { ok : true,  data  : json as T  }
      : { ok : false, error : json.error }
  } catch {
    return { ok : false, error : `${res.status}: ${res.statusText}` }
  }
}
