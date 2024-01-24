import {
  EscrowClient,
} from '@scrow/core/client'

import CONFIG from '../config.js'

// Startup a local process of Bitcoin Core for testing.
const config = CONFIG.regtest
const client = new EscrowClient(config.client)

const txid   = '12330e6eada8aaa5a5d14001ad97d814d68c0d27a3c8838f9f250a1c96c470e7'
const txdata = await client.oracle.get_txdata(txid)

console.log('txdata:', txdata)
