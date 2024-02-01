import { print_banner }         from '@scrow/test'
import { client }               from '../../01_create_client.js'
import { proposal, signatures } from '../../04_roles_and_endorse.js'

// Deliver proposal and endorsements to server.
const res = await client.contract.create(proposal, signatures)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * Define our published contract.
 */
export const { contract } = res.data

print_banner('new contract')
console.dir(contract, { depth : null })
