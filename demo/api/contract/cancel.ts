import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { moderator }    from '@scrow/demo/03_build_proposal.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'

// Define the contract id we will cancel.
const cid = new_contract.cid
// Generate an auth token from the moderator's signer.
const cancel_tkn = moderator.request.contract_cancel(cid)
// Send the cancel request, along with the auth token.
const cancel_res = await client.contract.cancel(cid, cancel_tkn)
// If the request fails, throw an error.
if (!cancel_res.ok) throw new Error(cancel_res.error)
// Unwrap our response payload.
export const canceled_contract = cancel_res.data.contract

print_banner('canceled contract')
console.dir(canceled_contract)
console.log('\n')
