import { EscrowClient } from "@scrow/core/client"

// Define a third-party client as a coordinator.
const client = new EscrowClient({
    hostname : 'https://bitescrow-mutiny.vercel.app',
    oracle   : 'https://mutinynet.com'
  })

const cid = 'c842e095ac98e43bc274c521282c506352009e921820a444c37c0992478ee962'

// Request an account for the member to use.
const ct_res = await client.contract.read(cid)

// Check the response is valid.
if (!ct_res.ok) throw new Error(ct_res.error)

const { contract } = ct_res.data

console.log('contract:', contract)
