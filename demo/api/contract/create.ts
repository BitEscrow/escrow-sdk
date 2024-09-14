/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/create
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/create
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { publish_req }  from '@scrow/demo/04_finish_proposal.js'

// Deliver the publish request to the server.
const res = await client.contract.create(publish_req)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our published contract.
const { contract } = res.data

print_banner('new contract')
console.dir(contract, { depth : null })
console.log('\n')
