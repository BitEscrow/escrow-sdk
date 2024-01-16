import { client } from "../proposal/configure_clients.js"

const dpid = '51c0e75f593da808a71077fb0f36b5b57ec292e4bfd9ad6cddf09fffcef20044'

// Request an account for the member to use.
const dp_res = await client.deposit.read(dpid)

// Check the response is valid.
if (!dp_res.ok) throw new Error(dp_res.error)

const { deposit } = dp_res.data

console.log('deposit:', deposit)
