import { print_banner } from '@scrow/test'

import { client }               from './01_create_client.js'
import { proposal, signatures } from './04_roles_and_endorse.js'

const res = await client.contract.create(proposal, signatures)

if (!res.ok) throw new Error(res.error)

export const { contract } = res.data

print_banner('new contract')
console.dir(contract, { depth : null })
