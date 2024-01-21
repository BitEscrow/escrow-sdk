import { EscrowClient } from '../class/client.js'

import {
  broadcast_tx,
  fee_estimates,
  get_fee_target,
  get_utxo_data,
  get_tx_data
} from '@/lib/oracle.js'

import { OracleQuery } from '@/types/index.js'

import * as assert from '@/assert.js'

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


function get_fee_target_api (client: EscrowClient) {
  return async (target : number) => {
    return get_fee_target(client._oracle, target)
  }
}

function get_txdata_api (client: EscrowClient) {
  return async (txid : string) => {
    assert.is_hash(txid)
    return get_tx_data(client._oracle, txid)
  }
}

function get_utxo_api (client: EscrowClient) {
  return async (query : OracleQuery) => {
    assert.is_hash(query.txid)
    return get_utxo_data(client._oracle, query)
  }
}

export default function (client : EscrowClient) {
  return {
    broadcast_tx  : broadcast_tx_api(client),
    fee_estimates : fee_estimates_api(client),
    fee_target    : get_fee_target_api(client),
    get_txdata    : get_txdata_api(client),
    get_utxo      : get_utxo_api(client)
  }
}