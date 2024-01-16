import { client, members } from "../proposal/configure_clients.js"

// Unpack a member for testing.
const [ a_mbr ] = members

const req_token = a_mbr.request.deposits()

// Request an account for the member to use.
const dp_res = await client.deposit.list(req_token)

// Check the response is valid.
if (!dp_res.ok) throw new Error(dp_res.error)

const { deposits } = dp_res.data

console.log('deposits:', deposits)
