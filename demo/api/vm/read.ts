/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/vmstate
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/vmstate
 */

import { print_banner }    from '@scrow/test'
import { client }          from '@scrow/demo/01_create_client.js'
// import { active_contract } from '@scrow/demo/08_check_contract.js'

// Define the contract id we will use.
const vmid = 'c1c04cdde4a596879235a521f3185a6c56a318c92f9659b38a48fcc80a77d0b0'
// Fetch a contract's vm state from the server via cid.
const res = await client.vm.read(vmid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const data = res.data

print_banner('vm state')
console.dir(data, { depth : null })
console.log('\n')
