import { print_banner }    from '@scrow/test'
import { client }          from '@scrow/demo/01_create_client.js'
import { funded_contract } from '@scrow/demo/07_deposit_funds.js'
// Fetch a contract from the server by cid.
const res = await client.contract.funds(funded_contract.cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const funds = res.data.funds

print_banner('funds')
console.dir(funds, { depth : null })
console.log('\n')
