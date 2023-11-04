import { CoreDaemon } from '@cmdcode/core-cmd'

import { EscrowClient, Signer } from '@scrow/core'

import ctx from '../ctx.js'

const core = new CoreDaemon({
  network  : 'regtest',
  debug    : false,
  verbose  : false
})

const cli = await core.startup() 

const alice = { signer : Signer.seed('alice'), wallet : await cli.load_wallet('alice') }
const bob   = { signer : Signer.seed('bob'),   wallet : await cli.load_wallet('bob')   }
const carol = { signer : Signer.seed('carol'), wallet : await cli.load_wallet('carol') }

const hostname = ctx.escrow
const oracle   = ctx.oracle

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const proposal = {
  title     : 'Basic two-party contract with third-party dispute resolution.',
  expires   : 14400,
  details   : 'n/a',
  network   : 'regtest',
  moderator : alice.signer.pubkey,
  paths: [
    [ 'heads', 10000, await bob.wallet.new_address   ],
    [ 'tails', 10000, await alice.wallet.new_address ]
  ],
  payments : [
    [ 5000,  await bob.wallet.new_address ]
  ],
  programs : [
    [ 'close', 'heads', 'proof', 1, alice.signer.pubkey ],
    [ 'close', 'tails', 'proof', 1, carol.signer.pubkey ]
  ],
  schedule: [
    [ 7200, 'close', 'heads|tails' ]
  ],
  value   : 15000,
  version : 1
}

const res = await client.contract.create(proposal)

console.log('contract:', res)
