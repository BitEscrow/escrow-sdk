import {
  EscrowClient,
  Signer
} from '@scrow/core'

import ctx from '../const.js'

const hostname = ctx.escrow
const oracle   = ctx.oracle

const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const deposit_id = ctx.dep[0].dpid

const deposit = await client.deposit.status(deposit_id)

console.log('Deposit data:', deposit)
