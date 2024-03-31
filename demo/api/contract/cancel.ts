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
import { new_contract }        from '@scrow/demo/05_create_contract.js'

// Generate an auth token from the moderator's signer.
const req = signer.contract.cancel(new_contract)
// Send the cancel request, along with the auth token.
const res = await client.contract.cancel(new_contract.cid, req)
// If the request fails, throw an error.
if (!res.ok) throw new Error(res.error)
// Unwrap our response payload.
export const canceled_contract = res.data.contract

print_banner('canceled contract')
console.dir(canceled_contract)
console.log('\n')
