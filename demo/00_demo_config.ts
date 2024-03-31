import { Network }           from '@scrow/sdk'
import { get_server_config } from '@scrow/test'

const faucets = {
  mutiny  : 'https://faucet.mutinynet.com',
  regtest : 'none',
  signet  : 'https://signet.bc-2.jp',
  testnet : 'https://bitcoinfaucet.uo1.net'
}

const returns = {
  mutiny  : 'tb1qd28npep0s8frcm3y7dxqajkcy2m40eysplyr9v',
  regtest : 'bcrt1qvjnqnzuyt7je5rhrc0gpjlrm2zagjjq5c9fwkp',
  signet  : 'tb1q5tsjcyz7xmet07yxtumakt739y53hcttmntajq',
  testnet : 'tb1q5tsjcyz7xmet07yxtumakt739y53hcttmntajq'
}

const poll_rates = {
  mutiny  : [ 10, 6  ],
  regtest : [ 10, 6  ],
  signet  : [ 60, 30 ],
  testnet : [ 60, 30 ]
}

const network = process.argv.slice(2)[0] ?? 'mutiny'
const client  = get_server_config(network as Network)

export const config = {
  network,
  client,
  faucet  : faucets[network as keyof typeof faucets],
  members : [ 'alice', 'bob', 'carol' ],
  poll    : poll_rates[network as keyof typeof poll_rates],
  return  : returns[network as keyof typeof returns]
}
