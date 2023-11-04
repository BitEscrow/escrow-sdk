
import {
  EscrowClient,
  Signer
} from '@scrow/core'

import ctx from '../ctx.js'

const hostname = ctx.escrow
const oracle   = ctx.oracle
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const dpid = 'de258d54a7508599ef05c832f5ca843d95d4b8d516a4f0b380970cee021c631f'

const contract = await client.covenant.remove(dpid)
const deposit  = await client.deposit.read(dpid)

console.log('Contract data :', contract.data)
console.log('Deposit data  :', deposit.data)
