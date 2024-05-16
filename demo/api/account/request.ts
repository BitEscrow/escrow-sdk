/**
 * Deposit API Demo for endpoint:
 * /api/account/request
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api//request
 */

import { print_banner } from '@scrow/test'
import { config }       from '@scrow/demo/00_demo_config.js'
import { client }       from '@scrow/demo/01_create_client.js'
import { signers }      from '@scrow/demo/02_create_signer.js'

// Define our funder for the deposit.
const funder   = signers[0]
// Define our deposit locktime.
const locktime    = config.locktime
// Define a return address for the deposit.
const return_addr = config.return_addr

// Get an account request from the funder device.
const acct_req    = funder.account.request(locktime, return_addr)
// Submit the account request to the server
const acct_res    = await client.account.request(acct_req)
// Check the response is valid.
if (!acct_res.ok) throw new Error(acct_res.error)
// Unpack our data response.
const new_account = acct_res.data.account

print_banner('new account')
console.dir(new_account, { depth : null })
console.log('\n')
