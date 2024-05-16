/**
 * Deposit API Demo for endpoint:
 * /api/deposit/:dpid/lock
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/deposit/lock
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { signers }      from '@scrow/demo/02_create_signer.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'
import { open_deposit } from '@scrow/demo/api/account/register.js'

// Define our funder for the deposit.
const funder = signers[0]
// Generate a lock request from the depositor.
const req = funder.deposit.lock(new_contract, open_deposit)
// Deliver the request and token.
const res = await client.deposit.lock(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const { contract, deposit } = res.data

print_banner('updated contract')
console.dir(contract, { depth : null })
print_banner('updated deposit')
console.dir(deposit, { depth : null })
console.log('\n')
