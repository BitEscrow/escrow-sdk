import { print_banner }    from '@scrow/test'
import { client }          from '@scrow/demo/01_create_client.js'
import { active_contract } from '@scrow/demo/08_check_contract.js'

// Fetch a contract's vm state from the server via cid.
const res = await client.contract.vmstate(active_contract.cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const data = res.data

print_banner('vm state')
console.dir(data, { depth : null })
console.log('\n')
