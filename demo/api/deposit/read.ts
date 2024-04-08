/**
 * Deposit API Demo for endpoint:
 * /api/deposit/:dpid
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/deposit/read
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'

// Define the deposit id we will use.
const dpid = process.argv.slice(2).at(0)
// If dpid is not specified, throw an error
if (dpid === undefined) throw "must provide a 'dpid' value as an argument"

// Request to read a deposit via dpid.
const res = await client.deposit.read(dpid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data response
const deposit = res.data.deposit

print_banner('locked deposit')
console.dir(deposit, { depth : null })
console.log('\n')
