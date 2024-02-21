import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { depositor }    from '@scrow/demo/07_deposit_funds.js'

// Generate a request token.
const req = depositor.request.deposit_list()
// Deliver the request and token.
const res = await client.deposit.list(depositor.pubkey, req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const deposits = res.data.deposits

print_banner('deposit list')
console.dir(deposits, { depth : null })
console.log('\n')
