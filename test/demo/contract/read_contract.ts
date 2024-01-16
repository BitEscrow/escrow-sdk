import { EscrowClient } from "@scrow/core/client"

// Define a third-party client as a coordinator.
const client = new EscrowClient({
  hostname : 'http://localhost:3000',
  oracle   : 'http://172.21.0.3:3000'
})

const cid = 'e60f610a4c53cc854efe0da891fed4d7cc61261ffe37ec8275de129ba20613fc'

// Request an account for the member to use.
const ct_res = await client.contract.read(cid)

// Check the response is valid.
if (!ct_res.ok) throw new Error(ct_res.error)

const { contract } = ct_res.data

console.log('contract:', contract)
