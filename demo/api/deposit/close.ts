import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
import { depositor }    from './request.js'
import { open_deposit } from './register.js'

// Define the dpid for the deposit we are using.
const dpid = open_deposit.dpid
// Define a txfee for the close transaction.
const txfee = 1000
// Generate a lock request from the depositor.
const close_req = depositor.account.close(open_deposit, txfee)
// Deliver the request and token.
const res = await client.deposit.close(dpid, close_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const closed_deposit = res.data.deposit

print_banner('closed deposit')
console.dir(closed_deposit, { depth : null })
console.log('\n')
