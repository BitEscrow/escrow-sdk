import { CoreDaemon } from '@cmdcode/core-cmd'

import {
  EscrowClient,
  Signer
} from '@scrow/core'

import ctx from '../ctx.js'

const core = new CoreDaemon({
  debug   : false,
  verbose : false
})

const cli      = await core.startup() 
const wallet   = await cli.load_wallet('alice')

await cli.mine_blocks(1)

const hostname = ctx.escrow
const oracle   = ctx.oracle
const signer   = Signer.seed('alice')

const client   = new EscrowClient(signer, { hostname, oracle })
const pubkey   = signer.pubkey

const info = await client.deposit.request({ pubkey })

console.log('Deposit Info:', info)

const { address, agent_id, agent_key, sequence } = info

await wallet.ensure_funds(1_000_000)

const txid = await wallet.send_funds(60_000, address, true)

console.log('Deposit txid:', txid)
console.log('waiting for tx to propagate...')

// await delay(10000)

const cid = ctx.cid

const tmpl = await client.deposit.create(agent_id, agent_key, sequence, txid, { cid })

console.log('Deposit template:', tmpl)

const deposit = await client.deposit.register(tmpl)

console.log('Deposit data:', deposit)
