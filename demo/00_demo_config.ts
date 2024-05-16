import { Network }           from '@scrow/sdk'
import { get_server_config } from '@scrow/test'

import DefaultEngine from '@/vm/index.js'
import DefaultPolicy from '@/client/config/policy.js'

const faucets = {
  mutiny  : 'https://faucet.mutinynet.com',
  regtest : 'none',
  signet  : 'https://signet.bc-2.jp',
  testnet : 'https://bitcoinfaucet.uo1.net'
}

const returns = {
  mutiny  : 'tb1phdk3ag8vmjdmlx0ugwvmleh2qf22k28kp8mw7t7su6ucqmmvuauqvav4s3',
  regtest : 'bcrt1pdcfvw8ulj6qtr8mj8gjqgl76ff8l8q2fjmvect8m0p22ghl2dsgqzjk3hd',
  signet  : 'tb1q5tsjcyz7xmet07yxtumakt739y53hcttmntajq',
  testnet : 'tb1q5tsjcyz7xmet07yxtumakt739y53hcttmntajq'
}

const poll_rates = {
  mutiny  : [ 10, 6  ],
  regtest : [ 10, 6  ],
  signet  : [ 60, 30 ],
  testnet : [ 60, 30 ]
}

const feerate  = 2
const locktime = 172800
const network  = process.env.NETWORK ?? 'mutiny'
const client   = get_server_config(network as Network)

export const config = {
  client,
  feerate,
  locktime,
  network,
  engine      : DefaultEngine,
  faucet      : faucets[network as keyof typeof faucets],
  members     : [ 'alice', 'bob', 'carol' ],
  policy      : DefaultPolicy,
  poll        : poll_rates[network as keyof typeof poll_rates],
  return_addr : returns[network as keyof typeof returns]
}
