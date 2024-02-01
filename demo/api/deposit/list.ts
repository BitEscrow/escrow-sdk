import { Buff } from '@cmdcode/buff'

import {
  EscrowClient,
  EscrowSigner
} from '@scrow/core/client'

import { config } from '../../00_demo_config.js'

const seed   = Buff.str('alice')

const client = new EscrowClient(config)
const signer = EscrowSigner.create(config, seed)
const token  = signer.request.deposits()

// Request an account for the member to use.
const res = await client.deposit.list(signer.pubkey, token)

// Check the response is valid.
if (!res.ok) throw new Error(res.error)

const { deposits } = res.data

console.dir(deposits, { depth : null })
