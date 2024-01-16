import { EscrowClient } from "@scrow/core/client"

// Define a third-party client as a coordinator.
const client = new EscrowClient({
  hostname : 'http://localhost:3000',
  oracle   : 'http://172.21.0.3:3000'
})

const cid = '289a63cd3afdde7d145f39ff5b3ea7caa7ece361a92c422fd8b4c8b07653b278'

// Request an account for the member to use.
const ct_res = await client.contract.read(cid)

// Check the response is valid.
if (!ct_res.ok) throw new Error(ct_res.error)

const { contract } = ct_res.data

console.log('contract:', contract)
