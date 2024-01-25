import { print_banner } from '@scrow/test'

import { signers } from './02_create_signer.js'

const signer   = signers[0]
const locktime = 60 * 60 // 1 hour locktime

const res = await signer.deposit.request_acct(locktime)

// Check the response is valid.
if (!res.ok) throw new Error(res.error)

// Unpack some of the terms.
export const account = res.data.account

print_banner('deposit account')
console.dir(account, { depth : null })
