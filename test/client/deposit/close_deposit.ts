import { client, members } from "../proposal/configure_clients.js"

// Unpack a member for testing.
const [ a_mbr ] = members

const dpid = '51c0e75f593da808a71077fb0f36b5b57ec292e4bfd9ad6cddf09fffcef20044'

// Request an account for the member to use.
const dp_res = await client.deposit.read(dpid)

// Check the response is valid.
if (!dp_res.ok) throw new Error(dp_res.error)

const { deposit } = dp_res.data

const ret_data = await a_mbr.deposit.close_deposit(deposit, 1000)

// Request an account for the member to use.
const ret_res = await client.deposit.close(ret_data)

// Check the response is valid.
if (!ret_res.ok) throw new Error(ret_res.error)

const { deposit : new_deposit } = dp_res.data

console.log('new deposit:', new_deposit)
