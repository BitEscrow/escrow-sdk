/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/witness
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/witness
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'

// Define the deposit id we will use.
const vmid = process.argv.slice(2).at(0)
// If dpid is not specified, throw an error
if (vmid === undefined) throw "must provide a 'vmid' value as an argument"

// Fetch a contract from the server by cid.
const res = await client.witness.list(vmid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const statements = res.data.statements

print_banner('statements')
console.dir(statements, { depth : null })
console.log('\n')
