/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/witness
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/witness
 */

import { print_banner }     from '@scrow/test'
import { client }           from '@scrow/demo/01_create_client.js'
import { settled_contract } from '@scrow/demo/09_settle_contract.js'

// Define the contract id we will use.
const cid = settled_contract.cid
// Fetch a contract from the server by cid.
const res = await client.vm.list(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const statements = res.data.statements

print_banner('statements')
console.dir(statements, { depth : null })
console.log('\n')
