import { now }          from '@scrow/sdk/util'
import { print_banner } from '@scrow/test'

import { config }  from './00_demo_config.js'
import { client }  from './01_create_client.js'
import { signers } from './02_create_signer.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

/**
 * Choose a signer to act as the funder of the contract.
 * This signer will specify a locktime for the escrow, plus
 * a return address for if / when the deposit is closed.
 */
const funder      = signers[0]
// Define our deposit locktime.
const locktime    = config.locktime
// Define a return address for the deposit.
const return_addr = funder.wallet.new(now())

/**
 * Request a deposit account from the escrow server. This account
 * will include a 2-of-2 musig deposit address, plus a commitment
 * token to use when creating a covenant.
 */
const req = funder.account.request(locktime, return_addr)
// Submit the account request to the escrow server.
const res = await client.account.request(req)
// Check the server response is valid.
if (!res.ok) throw new Error(res.error)
// Verify that the account is valid.
funder.account.verify(res.data.account)

/**
 * The server will respond with a new AccountData object. This 
 * account will be signed using the escrow server's public key.
 */
const new_account = res.data.account

if (DEMO_MODE) {
  print_banner('new account')
  console.dir(new_account, { depth : null })
}

export { funder, new_account }
