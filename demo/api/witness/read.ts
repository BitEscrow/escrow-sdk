/**
 * Witness API Demo for endpoint:
 * /api/witness/:wid
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/witness/read
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'

// Define the deposit id we will use.
const wid = process.argv.slice(2).at(0)
// If dpid is not specified, throw an error
if (wid === undefined) throw "must provide a 'wid' value as an argument"

// Fetch a contract from the server by cid.
const res = await client.witness.read(wid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const { commit } = res.data

print_banner('witness statement')
console.dir(commit, { depth : null })
console.log('\n')
