import { EscrowClient } from '@scrow/core'
import { sign }         from '@/lib/programs/index.js'
import { get_funds }    from '../fund.js'

import {
  get_daemon,
  get_users
} from '../core.js'

const config = {
  network     : 'regtest',
  debug       : false,
  verbose     : false
}

const core     = get_daemon(config)
const cli      = await core.startup()
const alias    = [ 'alice', 'bob', 'carol' ]
const members  = await get_users(cli, alias)

const [ alice, bob, carol ] = members

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const proposal = {
  title     : 'Basic two-party contract with third-party dispute resolution.',
  expires   : 14400,
  details   : 'n/a',
  network   : 'regtest',
  moderator : alice.signer.pubkey,
  paths: [
    [ 'heads', 10000, await alice.wallet.new_address ],
    [ 'tails', 10000, await bob.wallet.new_address   ],
    [ 'draw',  5000,  await alice.wallet.new_address ],
    [ 'draw',  5000,  await bob.wallet.new_address   ]
  ],
  payments : [
    [ 5000,  await carol.wallet.new_address ]
  ],
  programs : [
    [ 'endorse', 'close', 'heads|tails', 2, alice.signer.pubkey, bob.signer.pubkey ]
  ],
  schedule: [
    [ 7200, 'close', 'draw' ]
  ],
  value   : 15000,
  version : 1
}

const contract = await client.contract.create(proposal)

console.log('contract:', contract.data)

const funds = await get_funds(contract.data, members)

await cli.mine_blocks(1)

console.log('templates:', funds)

for (const fund of funds) {
  await client.deposit.register(fund)
}

const status   = await client.contract.status(contract.cid)

console.log('status:', status)

const programs = contract.terms.programs

const wit = sign.create_witness('close', 'heads', programs, alice.signer)
const res = await client.witness.submit(contract.cid, wit)

console.log('res:', res)
