/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/cancel
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/cancel
 */

import { print_banner }        from '@scrow/test'
import { client }              from '@scrow/demo/01_create_client.js'
import { moderator as signer } from '@scrow/demo/03_create_proposal.js'

// Define the contract id we will use.
const cid = process.argv.slice(2).at(0)
// If cid is not specified, throw an error
if (cid === undefined) throw "must provide a 'cid' value as an argument"

// Generate an auth token from the moderator's signer.
const req = signer.contract.cancel(cid)
// Send the cancel request, along with the auth token.
const res = await client.contract.cancel(cid, req)
// If the request fails, throw an error.
if (!res.ok) throw new Error(res.error)
// Unwrap our response payload.
export const canceled_contract = res.data.contract

print_banner('canceled contract')
console.dir(canceled_contract)
console.log('\n')
