import { print_banner } from '@scrow/test'
import { client }       from './01_create_client.js'
import { signers }      from './02_create_signer.js'

const DEMO_MODE = process.env.DEMO_MODE === 'true'

// Define our deposit locktime.
const locktime = 60 * 60  // 1 hour locktime
// Define our funder for the deposit.
const funder   = signers[0]
// Get an account request from the funder device.
const acct_req  = funder.account.create('', locktime)
// Submit the account request to the server
const acct_res = await client.deposit.request(acct_req)
// Check the response is valid.
if (!acct_res.ok) throw new Error(acct_res.error)

/**
 * Define our new deposit account.
 */
export const new_account = acct_res.data.account

if (DEMO_MODE) {
  print_banner('new account')
  console.dir(new_account, { depth : null })
}
