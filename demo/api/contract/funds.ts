/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/funds
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/funds
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'

// Define the contract id we will use.
const cid = process.argv.slice(2).at(1)
// If cid is not specified, throw an error
if (cid === undefined) throw "must provide a 'cid' value as an argument"
// Fetch a contract from the server by cid.
const res = await client.contract.funds(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const funds = res.data.funds

print_banner('funds')
console.dir(funds, { depth : null })
console.log('\n')
