import { EscrowClient, Signer } from '@scrow/core'

import ctx from '../ctx.js'

const alice = { signer : Signer.seed('alice') }

const hostname = ctx.escrow
const oracle   = ctx.oracle

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const cid = ctx.cid

const witness = await client.witness.list(cid)

console.log('Witness:', witness)
