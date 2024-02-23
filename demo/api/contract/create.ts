/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/create
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/create
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { draft }        from '@scrow/demo/04_finish_draft.js'

// Deliver proposal and endorsements to server.
const res = await client.contract.create(draft)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our published contract.
const new_contract = res.data.contract

print_banner('new contract')
console.dir(new_contract, { depth : null })
console.log('\n')
