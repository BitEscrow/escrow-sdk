import { client } from "../proposal/configure_clients.js"

const cid = 'e60f610a4c53cc854efe0da891fed4d7cc61261ffe37ec8275de129ba20613fc'

// Request an account for the member to use.
const fund_res = await client.contract.funds(cid)

// Check the response is valid.
if (!fund_res.ok) throw new Error(fund_res.error)

const { deposits } = fund_res.data

console.log('funds:', deposits)
