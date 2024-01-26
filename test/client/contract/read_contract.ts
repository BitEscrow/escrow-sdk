import { EscrowClient } from "@scrow/core/client"

import CONFIG from '../config.js'

// Define a third-party client as a coordinator.
const client = new EscrowClient(CONFIG.regtest.client)
const cid    = '798e5e4a51e60dea79690dcd3114f65fa510c539514e8f89d6a22beaed98473a'

// Request an account for the member to use.
const ct_res = await client.contract.read(cid)

// Check the response is valid.
if (!ct_res.ok) throw new Error(ct_res.error)

const { contract } = ct_res.data

console.log('contract:', contract)
