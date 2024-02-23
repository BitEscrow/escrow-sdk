/**
 * Deposit API Demo for endpoint:
 * /api/deposit/:dpid/status
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/deposit/status
 */

import { print_banner }   from '@scrow/test'
import { client }         from '@scrow/demo/01_create_client.js'
import { locked_deposit } from '@scrow/demo/07_deposit_funds.js'

// Define the deposit id we will use.
const dpid = locked_deposit.dpid
// Request to read a deposit via dpid.
const res = await client.deposit.status(dpid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data response
const deposit = res.data.deposit

print_banner('deposit status')
console.dir(deposit, { depth : null })
console.log('\n')
