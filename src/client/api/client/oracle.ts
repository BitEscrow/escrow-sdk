/* Global Imports */

import { assert, sleep } from '@/core/util/index.js'

import {
  broadcast_tx,
  fee_estimates,
  get_fee_target,
  get_utxo_data,
  get_tx_data,
  get_address_utxos
} from '@/core/util/oracle.js'

import {
  OracleQuery,
  OracleSpendData
} from '@/core/types/index.js'

/* Module Imports */

import { EscrowClient } from '@/client/class/client.js'

function broadcast_tx_api (client : EscrowClient) {
  return async (txhex : string) => {
    assert.is_hex(txhex)
    return broadcast_tx(client.oracle_url, txhex)
  }
}

function fee_estimates_api (client : EscrowClient) {
  return async () => {
    return fee_estimates(client.oracle_url)
  }
}

function get_fee_target_api (client : EscrowClient) {
  return async (target : number) => {
    return get_fee_target(client.oracle_url, target)
  }
}

function get_txdata_api (client : EscrowClient) {
  return async (txid : string) => {
    assert.is_hash(txid)
    return get_tx_data(client.oracle_url, txid)
  }
}

function get_utxo_api (client : EscrowClient) {
  return async (query : OracleQuery) => {
    assert.is_hash(query.txid)
    return get_utxo_data(client.oracle_url, query)
  }
}

function get_addr_utxos_api (client : EscrowClient) {
  return async (address : string) => {
    return get_address_utxos(client.oracle_url, address)
  }
}

function poll_address_api (client : EscrowClient) {
  return async (
    address  : string,
    interval : number,
    retries  : number,
    verbose  = false
  ) => {
    let tries = 0,
        utxos : OracleSpendData[] = []
    for (let i = 0; i < retries; i++) {
      if (utxos.length > 0) {
        return utxos
      } else {
        utxos = await get_address_utxos(client.oracle_url, address)
        tries += 1
        if (verbose) {
          const msg = `[${tries}/${retries}] checking address in ${interval} seconds...`
          console.log(msg)
        }
        await sleep(interval * 1000)
      }
    }
    throw new Error('polling timed out')
  }
}

export default function (client : EscrowClient) {
  return {
    broadcast_tx      : broadcast_tx_api(client),
    fee_estimates     : fee_estimates_api(client),
    fee_target        : get_fee_target_api(client),
    get_txdata        : get_txdata_api(client),
    get_utxo          : get_utxo_api(client),
    get_address_utxos : get_addr_utxos_api(client),
    poll_address      : poll_address_api(client)
  }
}
