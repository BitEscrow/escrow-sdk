import { print_banner }         from '@scrow/test'
import { client }               from '../../01_create_client.js'
import { proposal, signatures } from '../../04_roles_and_endorse.js'

// Deliver proposal and endorsements to server.
const res = await client.contract.create(proposal, signatures)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our published contract.
const new_contract = res.data.contract

print_banner('new contract')
console.dir(new_contract, { depth : null })
console.log('\n')
