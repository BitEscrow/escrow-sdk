import { Buff } from '@cmdcode/buff'

import {
  EscrowClient,
  EscrowSigner
} from '@scrow/core/client'

import { config } from '../../00_demo_config.js'

const seed   = Buff.str('alice')

const client = new EscrowClient(config)
const signer = EscrowSigner.create(config, seed)
const token  = signer.request.contracts()

// Request an account for the member to use.
const res = await client.contract.list(signer.pubkey, token)

// Check the response is valid.
if (!res.ok) throw new Error(res.error)

const { contracts } = res.data

console.dir(contracts, { depth : null })
