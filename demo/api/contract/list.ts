/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/list
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/list
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { signers }      from '@scrow/demo/02_create_signer.js'

// Select a signer to use.
const signer = signers[0]
// Generate a request token.
const req = signer.contract.list()
// Submit the request and token.
const res = await client.contract.list(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data payload.
const { contracts } = res.data

print_banner('contract list')
console.dir(contracts, { depth : null })
console.log('\n')
