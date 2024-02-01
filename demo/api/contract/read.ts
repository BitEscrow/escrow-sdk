import { EscrowClient } from '@scrow/core/client'
import { config }       from '../../00_demo_config.js'

const cid    = '798e5e4a51e60dea79690dcd3114f65fa510c539514e8f89d6a22beaed98473a'

const client = new EscrowClient(config)

// Request an account for the member to use.
const res = await client.contract.read(cid)

// Check the response is valid.
if (!res.ok) throw new Error(res.error)

const { contract } = res.data

console.dir(contract, { depth : null })
