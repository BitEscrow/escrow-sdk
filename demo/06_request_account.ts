import { print_banner } from '@scrow/test'
import { client }       from './01_create_client.js'
import { signers }      from './02_create_signer.js'

const pubkey   = signers[0].pubkey 
const locktime = 60 * 60  // 1 hour locktime
const res      = await client.deposit.request({ pubkey, locktime })

// Check the response is valid.
if (!res.ok) throw new Error(res.error)

// Unpack some of the terms.
export const account = res.data.account

print_banner('deposit account')
console.dir(account, { depth : null })
