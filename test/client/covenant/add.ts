
import {
  EscrowClient,
  Signer
} from '@scrow/core'

import ctx from '../const.js'

const hostname = ctx.escrow
const oracle   = ctx.oracle
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid  = ctx.cid
const dpid = ctx.dep[0].dpid

let contract = await client.contract.read(cid),
    deposit  = await client.deposit.read(dpid)

contract = await client.covenant.add(contract, deposit)
deposit  = await client.deposit.read(dpid)

console.log('Contract data :', contract.data)
console.log('Deposit data  :', deposit.data)
