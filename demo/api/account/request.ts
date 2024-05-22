/**
 * Account API Demo for endpoint:
 * /api/account/request
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/account/request
 */

import { print_banner } from '@scrow/test'
import { config }       from '@scrow/demo/00_demo_config.js'
import { client }       from '@scrow/demo/01_create_client.js'
import { signers }      from '@scrow/demo/02_create_signer.js'

// Define our signer for the account.
const signer      = signers[0]
// Define our deposit locktime.
const locktime    = config.locktime
// Define a return address.
const return_addr = config.return_addr

// Get an account request from the signing device.
const req = signer.account.request(locktime, return_addr)
// Submit the request to the server.
const res = await client.account.request(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the response data.
const { account } = res.data

print_banner('new account')
console.dir(account, { depth : null })
console.log('\n')
