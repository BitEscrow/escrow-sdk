import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'

// Fetch a contract from the server by cid.
const res = await client.contract.digest(new_contract.cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const contract = res.data.contract

print_banner('new contract digest')
console.dir(contract, { depth : null })
console.log('\n')
