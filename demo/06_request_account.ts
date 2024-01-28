import { print_banner } from '@scrow/test'
import { client }       from './01_create_client.js'
import { signers }      from './02_create_signer.js'

// Define our deposit locktime.
const locktime = 60 * 60  // 1 hour locktime
// Define our funder for the deposit.
const funder   = signers[0]
// Get an account request from the funder device.
const acct_req = funder.deposit.request_account(locktime)
// Submit the account request to the server
const acct_res = await client.deposit.request(acct_req)
// Check the response is valid.
if (!acct_res.ok) throw new Error(acct_res.error)

/**
 * Define our deposit account.
 */
export const { account } = acct_res.data

print_banner('deposit account')
console.dir(account, { depth : null })
