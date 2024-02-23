/**
 * Deposit API Demo for endpoint:
 * /api/deposit/request
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/deposit/request
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { signers }      from '@scrow/demo/02_create_signer.js'

// Define our funder for the deposit.
const depositor = signers[0]
// Define our deposit locktime.
const locktime  = 60 * 60  // 1 hour locktime
// Get an account request from the funder device.
const acct_req  = depositor.account.create(locktime)
// Submit the account request to the server
const acct_res = await client.deposit.request(acct_req)
// Check the response is valid.
if (!acct_res.ok) throw new Error(acct_res.error)
// Unpack our data response.
const new_account = acct_res.data.account

print_banner('new account')
console.dir(new_account, { depth : null })
console.log('\n')
