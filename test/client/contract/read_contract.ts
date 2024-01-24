import { EscrowClient } from "@scrow/core/client"

import CONFIG from '../config.js'

// Define a third-party client as a coordinator.
const client = new EscrowClient(CONFIG.regtest.client)
const cid    = '108abd1bcabf7c8cc4dcb8be824461b6d8146fbf3623f748bc1926ec818e42d1'

// Request an account for the member to use.
const ct_res = await client.contract.read(cid)

// Check the response is valid.
if (!ct_res.ok) throw new Error(ct_res.error)

const { contract } = ct_res.data

console.log('contract:', contract)
