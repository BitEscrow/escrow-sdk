const config = {
  servers: {
    mutiny : {
      faucet   : 'https://faucet.mutinynet.com',
      hostname : 'https://bitescrow-mutiny.vercel.app',
      oracle   : 'https://mutinynet.com',
      network  : 'mutiny',
      polling  : [ 10, 6 ],
      return   : 'tb1qd28npep0s8frcm3y7dxqajkcy2m40eysplyr9v',
    },
    regtest : {
      faucet   : 'bcrt1qvjnqnzuyt7je5rhrc0gpjlrm2zagjjq5c9fwkp',
      hostname : 'http://localhost:3000',
      oracle   : 'http://172.21.0.3:3300',
      network  : 'regtest',
      polling  : [ 10, 6 ],
      return   : 'bcrt1qvjnqnzuyt7je5rhrc0gpjlrm2zagjjq5c9fwkp'
    },

    signet : {
      faucet   : 'https://signet.bc-2.jp',
      hostname : 'https://bitescrow-signet.vercel.app',
      oracle   : 'https://mempool.space/signet',
      network  : 'signet',
      polling  : [ 60, 30 ],
      return   : 'tb1q5tsjcyz7xmet07yxtumakt739y53hcttmntajq'
    },

    testnet : {
      faucet   : 'https://bitcoinfaucet.uo1.net',
      hostname : 'https://bitescrow-testnet.vercel.app',
      oracle   : 'https://mempool.space/testnet',
      network  : 'testnet',
      polling  : [ 60, 30 ],
      return   : 'tb1q5tsjcyz7xmet07yxtumakt739y53hcttmntajq'
    }
  },

export const config = {
  network,
  client  : configs[network as keyof typeof configs],
  faucet  : faucets[network as keyof typeof faucets],
  members : [ 'alice', 'bob', 'carol' ],
  poll    : poll_rates[network as keyof typeof poll_rates],
  return  : returns[network as keyof typeof returns]
}
