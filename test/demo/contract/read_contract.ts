import { EscrowClient } from "@scrow/core/client"

// Define a third-party client as a coordinator.
const client = new EscrowClient({
  hostname : 'http://localhost:3000',
  oracle   : 'http://172.21.0.3:3000'
})

const cid = 'b312db089587b1b077d8fd82ca07f2668847de5412b8faeb62cb937dca9bfa45'

// Request an account for the member to use.
const ct_res = await client.contract.read(cid)

// Check the response is valid.
if (!ct_res.ok) throw new Error(ct_res.error)

const { contract } = ct_res.data

console.log('contract:', contract)
