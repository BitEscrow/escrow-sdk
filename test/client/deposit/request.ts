import {
  EscrowClient,
  Signer
} from '@scrow/core'

import ctx from '../const.js'

const hostname = ctx.escrow
const oracle   = ctx.oracle
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const info = await client.deposit.request({ pubkey : signer.pubkey, network : 'main' })

console.log('Deposit info:', info)
