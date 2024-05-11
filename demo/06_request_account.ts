import { now }          from '@scrow/sdk/util'
import { print_banner } from '@scrow/test'
import { config }       from './00_demo_config.js'
import { client }       from './01_create_client.js'
import { signers }      from './02_create_signer.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

// Define our funder for the deposit.
const funder      = signers[0]
// Define our deposit locktime.
const locktime    = config.locktime
// Define a return address for the deposit.
const return_addr = funder.wallet.new(now())

// Get an account request from the funder device.
const acct_req  = funder.account.request(locktime, return_addr)
// Submit the account request to the server
const acct_res = await client.account.request(acct_req)
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
