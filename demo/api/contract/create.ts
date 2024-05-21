/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/create
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/create
 */

import { print_banner } from '@scrow/test'
import CVM              from '@scrow/sdk/cvm'
import { config }       from '@scrow/demo/00_demo_config.js'
import { client }       from '@scrow/demo/01_create_client.js'
import { publish_req }  from '@scrow/demo/04_finish_proposal.js'

// Define the script engine to use.
const engine = CVM
// Define the server policy to use.
const policy = config.policy.proposal
// Deliver the publish request to the server.
const res = await client.contract.create(publish_req, engine, policy)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our published contract.
const { contract } = res.data

print_banner('new contract')
console.dir(contract, { depth : null })
console.log('\n')
