import { create_witness }       from '@/lib/witness.js'
import { EscrowClient, Signer } from '@scrow/core'

import ctx from '../ctx.js'

const alice    = { signer : Signer.seed('alice') }
const carol    = { signer : Signer.seed('carol') }
const hostname = ctx.escrow
const oracle   = ctx.oracle
const client   = new EscrowClient(carol.signer, { hostname, oracle })

const programs = [
  [ 'close', 'heads', 'proof', 1, alice.signer.pubkey ],
  [ 'close', 'tails', 'proof', 1, carol.signer.pubkey ]
]

const cid   = ctx.cid
const entry = create_witness('close', 'tails', client.signer, { programs })

console.log('Witness entry:', entry)

const contract = await client.witness.submit(cid, entry)

console.log('CVM State:')
console.dir(contract.data.vm_state, { depth : null })
