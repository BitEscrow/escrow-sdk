// c7d8c4b02af2a4edb6d839d855eccd3b1e4e6cb21f4ee9fb9ab738065e8d4d3d

import { EscrowClient, Signer } from '@scrow/core'

import ctx from '../ctx.js'

const alice = { signer : Signer.seed('alice') }

const hostname = ctx.escrow
const oracle   = ctx.oracle

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const txid = 'a2dae991e9810cd32cb5acf66e4ec6a5672e4cebe5c200860fafd18f62a60fa0'
const addr = 'bcrt1pgy4a269ke096l3eef75lc4nu7tuu7767znjud58fxfx00xc3yrzqf9hk0m'

const tx = await client.oracle.get_spend_out({ txid, address : addr })

console.log('tx:', tx)
