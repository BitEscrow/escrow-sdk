import {
  EscrowClient,
} from '@scrow/core/client'

import CONFIG from '../config.js'

// Startup a local process of Bitcoin Core for testing.
const config = CONFIG.localtest
const client = new EscrowClient(config.client)

const fees = await client.oracle.fee_estimates()

console.log('fees:', fees)
