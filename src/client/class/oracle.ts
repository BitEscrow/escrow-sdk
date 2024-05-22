import { parse_addr }     from '@scrow/tapscript/address'
import { sleep }          from '@/core/util/index.js'
import { get_fetcher }    from '@/client/lib/fetch.js'
import { OracleTxStatus } from '@/index.js'

import {
  OracleFeeEstimate,
  OracleTxData,
  OracleUtxo,
  OracleOutSpend,
  OracleUtxoData
} from '@/client/types/index.js'

import ClientSchema from '@/client/schema/index.js'

export class ChainOracle {
  readonly _host    : string
  readonly _fetcher : ReturnType<typeof get_fetcher>

  constructor (host : string, fetcher = fetch) {
    this._host    = host
    this._fetcher = get_fetcher(fetcher)
  }

  /**
   * Fetch transaction data from the oracle.
   */
  async get_tx (txid : string) : Promise<OracleTxData | null> {
    // Define the url to use for fetching.
    const url = `${this._host}/tx/${txid}`
    // Fetch a response from the oracle.
    const res = await this._fetcher.json<OracleTxData>(url)
    // If status is 404, return null.
    if (res.status === 404) return null
    // If the response failed, throw.
    if (!res.ok) throw new Error(res.error)
    // Parse the returned data.
    return ClientSchema.oracle.txdata.parseAsync(res.data)
  }

  /**
   * Fetch transaction status from the oracle.
   */
  async get_tx_status (txid : string) : Promise<OracleTxStatus | null> {
    // Define the url to use for fetching.
    const url = `${this._host}/tx/${txid}`
    // Fetch a response from the oracle.
    const res = await this._fetcher.json<OracleTxData>(url)
    // If status is 404, return null.
    if (res.status === 404) return null
    // If the response failed, throw.
    if (!res.ok) throw new Error(res.error)
    // Parse the returned data.
    return ClientSchema.oracle.tx_status.parseAsync(res.data)
  }

  /**
   * Fetch the spend state of an output from the oracle.
   */
  async get_outspend (
    txid : string,
    vout : number
  ) : Promise<OracleOutSpend> {
    // Define the url to use for fetching.
    const url = `${this._host}/tx/${txid}/outspend/${vout}`
    // Fetch a response from the oracle.
    const res = await this._fetcher.json<OracleUtxo>(url)
    // If failed for another reason, throw error.
    if (!res.ok) throw new Error(res.error)
    // Parse the returned data.
    return ClientSchema.oracle.outspend.parseAsync(res.data)
  }

  /**
   * Fetch the transaction output data from the oracle.
   */
  async get_utxo_data (
    txid : string,
    vout : number
  ) : Promise<OracleUtxoData | null> {
    // Fetch transaction data from the oracle.
    const tx = await this.get_tx(txid)
    // If the transaction is null, return null.
    if (tx === null) return null
    // Set the txout based on the resulting index.
    const txout = tx.vout.at(vout)
    // If txout is undefined, return null.
    if (txout === undefined) return null
    // Unpack the tx output.
    const { value, scriptpubkey: scriptkey } = txout
    // Define the utxo value.
    const utxo = { txid, vout, value, scriptkey }
    // Return the utxo data.
    return { status: tx.status, utxo }
  }

  async get_address_utxos (
    address : string
  ) : Promise<OracleUtxoData[]> {
    // Define the url to use for fetching.
    const url = `${this._host}/address/${address}/utxo`
    // Fetch a response from the oracle.
    const res = await this._fetcher.json<OracleUtxo[]>(url)
    // If response failed, throw error.
    if (!res.ok) throw new Error(res.error)
    // Parse the returned data.
    const parsed = await ClientSchema.oracle.utxo.array().spa(res.data)
    // If data fails validation, throw.
    if (!parsed.success) throw parsed.error
    // Return the parsed data.
    return parsed.data.map(({ txid, status, value, vout }) => {
      const scriptkey = parse_addr(address).hex
      const utxo      = { txid, vout, value, scriptkey }
      return { status, utxo }
    })
  }

  async get_first_utxo (address : string) : Promise<OracleUtxoData | null> {
    const utxos = await this.get_address_utxos(address)
    return utxos.at(0) ?? null
  }

  /**
   * Broadcast a transaction through the oracle.
   */
  async broadcast_tx (txhex : string) : Promise<string> {
    // Define the url to use for fetching.
    const url = `${this._host}/tx`
    // Configure the request.
    const req = {
      body    : txhex,
      headers : { 'content-type': 'text/plain' },
      method  : 'POST'
    }
    // Fetch a response from the oracle.
    const res = await this._fetcher.text(url, req)
    // If response failed, throw error.
    if (!res.ok) throw new Error(res.error)
    // Parse the returned data.
    return res.data
  }

  /**
   * Fetch a range of fee estimates from the oracle.
   */
  async get_fee_estimates () : Promise<OracleFeeEstimate> {
    // Define the url to use for fetching.
    const url = `${this._host}/fee-estimates`
    // Fetch a response from the oracle.
    const res = await this._fetcher.json<OracleFeeEstimate>(url)
    // If the response failed, throw.
    if (!res.ok) throw new Error(res.error)
    // Return the parsed data with rounded values.
    const entries = Object.entries(res.data)
    // Round the feerate values.
    const rounded = entries.map(([ k, v ]) => [ k, Math.ceil(v) ])
    // Return the feerate values.
    return Object.fromEntries(rounded)
  }

  /**
   * Fetch a fee quote from the oracle,
   * based on a target block height.
   */
  async get_fee_target (target : number) : Promise<number> {
    // Fetch an array of quotes from the oracle.
    const quotes  = await this.get_fee_estimates()
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

  async poll_address (
    address   : string,
    interval  : number,
    retries   : number,
    callback ?: (address : string, tries : number) => Promise<void>
  ) : Promise<OracleUtxoData> {
    let tries = 0,
        utxos : OracleUtxoData[] = []
    for (let i = 0; i < retries; i++) {
      if (utxos.length > 0) {
        return utxos[0]
      } else {
        utxos = await this.get_address_utxos(address)
        tries += 1
      }
      if (callback !== undefined) void callback(address, tries)
      await sleep(interval * 1000)
    }
    throw new Error('polling timed out')
  }
}
