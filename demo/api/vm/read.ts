/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/vmstate
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/vmstate
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'

// Define the deposit id we will use.
const vmid = process.argv.slice(2).at(1)
// If dpid is not specified, throw an error
if (vmid === undefined) throw "must provide a 'vmid' value as an argument"

// Fetch a contract's vm state from the server via cid.
const res = await client.vm.read(vmid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const data = res.data

print_banner('vm state')
console.dir(data, { depth : null })
console.log('\n')
