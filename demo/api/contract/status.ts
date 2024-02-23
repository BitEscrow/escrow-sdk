/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/status
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/status
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'

// Define the contract id we will use.
const cid = new_contract.cid
// Fetch a contract from the server by cid.
const res = await client.contract.status(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const status = res.data.contract

print_banner('contract status')
console.dir(status, { depth : null })
console.log('\n')
