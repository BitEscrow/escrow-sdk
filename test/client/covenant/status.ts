import {
  EscrowClient,
  Signer
} from '@scrow/core'

import ctx from '../ctx.js'

const hostname = ctx.escrow
const oracle   = ctx.oracle
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid   = ctx.cid
const funds = await client.covenant.list(cid)

console.log('Funds:', funds.map(e => e.data))
