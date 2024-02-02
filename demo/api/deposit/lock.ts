import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'
import { depositor }    from './request.js'
import { open_deposit } from './register.js'

// Define the dpid for the deposit we are using.
const dpid = open_deposit.dpid
// Generate a lock request from the depositor.
const lock_req = depositor.account.lock(new_contract, open_deposit)
// Deliver the request and token.
const res = await client.deposit.lock(dpid, lock_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const { contract, deposit } = res.data

print_banner('updated contract')
console.dir(contract, { depth : null })
print_banner('updated deposit')
console.dir(deposit, { depth : null })
console.log('\n')
