/**
 * Deposit API Demo for endpoint:
 * /api/deposit/:dpid/close
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/deposit/close
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { signers }      from '@scrow/demo/02_create_signer.js'

// Define the deposit id we will use.
const dpid = process.argv.slice(2).at(0)
// If dpid is not specified, throw an error.
if (dpid === undefined) throw "must provide a 'dpid' value as an argument"
// Request the deposit record from the server.
const read_res = await client.deposit.read(dpid)
// Assert that the response is ok.
if (!read_res.ok) throw new Error(read_res.error)
// Unpack the open deposit from the response.
const open_deposit = read_res.data.deposit

// Define our funder for the deposit.
const signer = signers[0]
// Define our return feerate.
const return_rate = 1

// Generate a close request from the depositor.
const req = signer.deposit.close(open_deposit, return_rate)
// Deliver the request and token.
const res = await client.deposit.close(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const { deposit } = res.data

print_banner('closed deposit')
console.dir(deposit, { depth : null })
console.log('\n')
