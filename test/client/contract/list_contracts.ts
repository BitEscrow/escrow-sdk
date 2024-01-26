import { client, members } from "../proposal/configure_clients.js"

// Unpack a member for testing.
const [ a_mbr ] = members

const req_token = a_mbr.request.contracts()

// Request an account for the member to use.
const ct_res = await client.contract.list(a_mbr.pubkey, req_token)

// Check the response is valid.
if (!ct_res.ok) throw new Error(ct_res.error)

const { contracts } = ct_res.data

console.log('contracts:', contracts)
