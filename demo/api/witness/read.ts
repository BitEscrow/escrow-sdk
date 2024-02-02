import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { witness }      from '@scrow/demo/09_settle_contract.js'

// Define the witness id we will use.
const wid = witness.wid
// Fetch a contract from the server by cid.
const res = await client.witness.read(wid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const fetched_witness = res.data.witness

print_banner('witness')
console.dir(fetched_witness, { depth : null })
console.log('\n')
