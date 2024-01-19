import {
  EscrowClient,
} from '@scrow/core/client'

import CONFIG from '../config.js'

// Startup a local process of Bitcoin Core for testing.
const config = CONFIG.localtest
const client = new EscrowClient(config.client)

const txid = '3fad0495c24ffc5e81cb52157cf2fbe7c8f4eecf70e1acd4b60dd96235703ccb'
const utxo = await client.oracle.get_utxo({ txid, vout : 0 })

console.log('utxo:', utxo)
