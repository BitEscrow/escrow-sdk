import { print_banner }     from '@scrow/test'
import { client }           from '@scrow/demo/01_create_client.js'
import { settled_contract } from '@scrow/demo/09_settle_contract.js'

// Fetch a contract from the server by cid.
const res = await client.contract.witness(settled_contract.cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const statements = res.data.statements

print_banner('statements')
console.dir(statements, { depth : null })
console.log('\n')
