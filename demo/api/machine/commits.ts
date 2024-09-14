/**
 * Machine API Demo for endpoint:
 * /api/machine/:vmid/commits
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/machine/commits
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'

// Get the identifier from the input.
const vmid = process.argv.slice(2).at(0)
// If an identifier is not specified, throw an error
if (vmid === undefined) throw "must provide a 'vmid' value as an argument"
// Fetch a list of statements for the machine.
const res = await client.machine.receipts(vmid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const { receipts } = res.data

print_banner('machine statements')
console.dir(receipts, { depth : null })
console.log('\n')
