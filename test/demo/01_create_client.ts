import { EscrowClient } from '@scrow/core/client'

const configs = {
  regtest : {
    hostname : 'http://localhost:3000',
    oracle   : 'http://172.21.0.3:3300',
    network  : 'regtest'
  },

  mutiny : {
    hostname : 'https://bitescrow-mutiny.vercel.app',
    oracle   : 'https://mutinynet.com',
    network  : 'signet'
  },

  signet : {
    hostname : 'https://bitescrow-signet.vercel.app',
    oracle   : 'https://mempool.space/signet',
    network  : 'signet'
  },

  testnet : {
    hostname : 'https://bitescrow-testnet.vercel.app',
    oracle   : 'https://mempool.space/testnet',
    network  : 'regtest'
  }
}

const network = process.argv.slice(2)[0] ?? 'regtest'

export const client_config = configs[network as keyof typeof configs]

export const client = new EscrowClient(client_config)
