import { CoreDaemon } from '@cmdcode/core-cmd'

import {
  EscrowClient,
  Signer
} from '@scrow/core'

import ctx from './ctx.js'

const core = new CoreDaemon({
  debug   : false,
  verbose : false
})

const cli      = await core.startup() 
const wallet   = await cli.load_wallet('alice')

const hostname = ctx.escrow
const oracle   = ctx.oracle
const signer   = Signer.seed('alice')

const client   = new EscrowClient(signer, { hostname, oracle })
const pubkey   = signer.pubkey

const info = await client.deposit.request({ pubkey })

console.log('Deposit Info:', info)

const { address, agent_id, agent_key, sequence } = info

await wallet.ensure_funds(100_000)
const txid = await wallet.send_funds(100_000, address, true)

console.log('Deposit txid:', txid)

const tmpl = await client.deposit.create(agent_id, agent_key, sequence, txid)

console.log('Deposit template:', tmpl)

const deposit = await client.deposit.register(tmpl)

console.log('Deposit Data:', deposit)
