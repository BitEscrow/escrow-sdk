import { EscrowClient } from '@scrow/core'
import ctx from '../const.js'

const alice = { signer : Signer.seed('alice') }

const hostname = ctx.escrow
const oracle   = ctx.oracle

const client   = new EscrowClient({ hostname, oracle })
const contract = await client.contract.list()

console.log('Contract:', contract)
