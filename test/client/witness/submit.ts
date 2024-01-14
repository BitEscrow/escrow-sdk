import { create_witness_sig }   from '@/lib/witness.js'

import {
  EscrowClient,
  Signer,
  ProgramTerms
} from '@scrow/core'

import ctx from '../const.js'

const alice    = { signer : Signer.seed('alice') }
const carol    = { signer : Signer.seed('carol') }
const hostname = ctx.escrow
const oracle   = ctx.oracle
const client   = new EscrowClient(alice.signer, { hostname, oracle })

const programs : ProgramTerms[] = [
  [ 'close', 'heads', 'sign', 1, alice.signer.pubkey ],
  [ 'close', 'tails', 'sign', 1, carol.signer.pubkey ]
]

const cid   = ctx.cid
const entry = create_witness_sig('close', 'tails', programs, client.signer)

console.log('Witness entry:', entry)

const contract = await client.witness.submit(cid, entry)

console.log('CVM State:')
console.dir(contract.data.vm_state, { depth : null })
