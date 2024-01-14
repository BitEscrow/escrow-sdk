import { EscrowClient } from '../class/client.js'

import {
  broadcast_tx,
  fee_estimates,
  get_fee_target,
  get_spend_data,
  get_tx_data
} from '@/lib/oracle.js'

import { OracleQuery } from '@/types/index.js'

import * as assert from '@/assert.js'

export default function (client : EscrowClient) {
  const url = client._oracle
  return {
    broadcast_tx : async (txhex : string) => {
      assert.is_hex(txhex)
      return broadcast_tx(url, txhex)
    },
    fee_estimates : async () => {
      return fee_estimates(url)
    },
    get_fee_target : async (target : number) => {
      return get_fee_target(url, target)
    },
    get_tx_data : async (txid : string) => {
      assert.is_hash(txid)
      return get_tx_data(url, txid)
    },
    get_spend_out : async (query : OracleQuery) => {
      assert.is_hash(query.txid)
      return get_spend_data(url, query)
    }
  }
}