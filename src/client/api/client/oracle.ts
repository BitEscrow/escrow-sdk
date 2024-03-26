/* Module Imports */

import {
  broadcast_tx,
  fee_estimates,
  get_fee_target,
  get_utxo_data,
  get_tx_data,
  get_address_utxos
} from '@/core/lib/oracle.js'

import {
  OracleQuery,
  OracleSpendData
} from '@/core/types/index.js'

import * as assert from '@/assert.js'
import { sleep }   from '@/util.js'

/* Local Imports */

import { EscrowClient } from '@/client/class/client.js'

function broadcast_tx_api (client : EscrowClient) {
  return async (txhex : string) => {
    assert.is_hex(txhex)
    return broadcast_tx(client._oracle, txhex)
  }
}

function fee_estimates_api (client : EscrowClient) {
  return async () => {
    return fee_estimates(client._oracle)
  }
}

function get_fee_target_api (client : EscrowClient) {
  return async (target : number) => {
    return get_fee_target(client._oracle, target)
  }
}

function get_txdata_api (client : EscrowClient) {
  return async (txid : string) => {
    assert.is_hash(txid)
    return get_tx_data(client._oracle, txid)
  }
}

function get_utxo_api (client : EscrowClient) {
  return async (query : OracleQuery) => {
    assert.is_hash(query.txid)
    return get_utxo_data(client._oracle, query)
  }
}

function get_addr_utxos_api (client : EscrowClient) {
  return async (address : string) => {
    return get_address_utxos(client._oracle, address)
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
        utxos = await get_address_utxos(client._oracle, address)
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
