import { EscrowClient } from "@scrow/core/client"

import CONFIG from '../config.js'

// Define a third-party client as a coordinator.
const client = new EscrowClient(CONFIG.testnet.client)
const cid    = '3ed7994a1aeade71a6acb8f105b0eceae8b8c61b6fda7f9dfd2e9f6fa3e33d7e'

// Request an account for the member to use.
const ct_res = await client.contract.read(cid)

// Check the response is valid.
if (!ct_res.ok) throw new Error(ct_res.error)

const { contract } = ct_res.data

console.log('contract:', contract)
