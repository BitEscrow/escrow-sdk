/**
 * Deposit API Demo for endpoint:
 * /api/deposit/:dpid/close
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/deposit/close
 */

import { print_banner } from '@scrow/test'
import { sleep }        from '@scrow/demo/util.js'
import { config }       from '@scrow/demo/00_demo_config.js'
import { client }       from '@scrow/demo/01_create_client.js'
import { signers }      from '@scrow/demo/02_create_signer.js'
import { open_deposit } from '@scrow/demo/api/deposit/register.js'

// Unpack our polling config.
const [ ival, retries ] = config.poll
// Define the dpid for the deposit we are using.
const dpid = open_deposit.dpid

// Fetch the current contract data.
let res_status = await client.deposit.status(dpid),
    tries      = 1

print_banner('awaiting confirmation of deposit')
console.log('depending on the network, this could take a while!\n')

// While our response is ok, but the contract is not active (and we have tries):
while (
  res_status.ok && 
  res_status.data.deposit.status !== 'open' && 
  tries < retries
) {
  // Print our current status to console.
  console.log(`[${tries}/${retries}] re-checking deposit in ${ival} seconds...`)
  // Sleep for interval seconds.
  await sleep(ival * 1000)
  // Fetch the latest contract data.
  res_status = await client.deposit.status(dpid)
  // Increment our tries counter
  tries += 1
}

// If the response failed, throw error.
if (!res_status.ok) throw new Error(res_status.error)

// Define our funder for the deposit.
const depositor = signers[0]
// Define a txfee for the close transaction.
const txfee = 1000
// Generate a lock request from the depositor.
const close_req = depositor.account.close(open_deposit, txfee)
// Deliver the request and token.
const res = await client.deposit.close(dpid, close_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const closed_deposit = res.data.deposit

print_banner('closed deposit')
console.dir(closed_deposit, { depth : null })
console.log('\n')
