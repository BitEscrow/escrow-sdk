import { CoreDaemon }  from '@cmdcode/core-cmd'
import { get_members } from 'test/src/core.js'
import CONST           from '../const.js'

import {
  EscrowClient,
  Network
} from '@scrow/core'
import { parse_proposal } from '@/lib/parse.js'

const core = new CoreDaemon({
  network  : 'regtest',
  debug    : false,
  verbose  : false
})

const corecli = await core.startup()
const members = await get_members(corecli, [ 'alice', 'bob', 'carol' ])
const client  = new EscrowClient({
  hostname : CONST.escrow,
  oracle   : CONST.oracle
})

const [ alice, bob, carol ] = members

const proposal = parse_proposal({
  title     : 'Basic two-party contract with third-party dispute resolution.',
  expires   : 14400,
  details   : 'n/a',
  network   : 'regtest' as Network,
  moderator : alice.signer.pubkey,
  paths: [
    [ 'heads', 10000, await alice.core.new_address ],
    [ 'tails', 10000, await bob.core.new_address   ],
    [ 'draw',  5000,  await alice.core.new_address ],
    [ 'draw',  5000,  await bob.core.new_address   ]
  ],
  payments : [
    [ 5000,  await carol.core.new_address ]
  ],
  programs : [
    [ 'sign', 'close|dispute', '*', 2, alice.signer.pubkey, bob.signer.pubkey ],
    [ 'sign', 'resolve',       '*', 1, carol.signer.pubkey ]
  ],
  schedule: [
    [ 7200, 'close', 'draw' ]
  ],
  value   : 15000,
  version : 1
})

const res = await client.contract.create(proposal)

console.log('contract:', res)
