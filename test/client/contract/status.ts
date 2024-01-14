import {
  EscrowClient,
  Signer
} from '@scrow/core'

import ctx from '../const.js'

const hostname = ctx.escrow
const oracle   = ctx.oracle
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid    = ctx.cid
const status = await client.contract.status(cid)

console.log('Covenant status:', status)
