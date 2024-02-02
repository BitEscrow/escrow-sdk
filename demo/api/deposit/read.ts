import { print_banner }   from '@scrow/test'
import { client }         from '@scrow/demo/01_create_client.js'
import { locked_deposit } from '@scrow/demo/07_deposit_funds.js'

// Request to read a deposit via dpid.
const res = await client.deposit.read(locked_deposit.dpid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data response
const deposit = res.data.deposit

print_banner('locked deposit')
console.dir(deposit, { depth : null })
console.log('\n')
