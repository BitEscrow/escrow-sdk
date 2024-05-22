/**
 * Machine API Demo for endpoint:
 * /api/machine/list
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/machine/list
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { signers }      from '@scrow/demo/02_create_signer.js'

// Select a signer to use.
const signer = signers[0]
// Generate a request token.
const req = signer.machine.list()
// Deliver the request and token.
const res = await client.machine.list(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data payload.
const { machines } = res.data

print_banner('machine list')
console.dir(machines, { depth : null })
console.log('\n')
