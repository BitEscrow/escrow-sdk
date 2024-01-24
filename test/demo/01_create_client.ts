import { EscrowClient } from '@scrow/core/client'

export const regtest_config = {
  hostname : 'http://localhost:3000',
  oracle   : 'http://172.21.0.3:3300',
  network  : 'regtest'
}

export const mutiny_config = {
  hostname : 'https://bitescrow-mutiny.vercel.app',
  oracle   : 'https://mutinynet.com',
  network  : 'signet'
}

export const signet_config = {
  hostname : 'https://bitescrow-signet.vercel.app',
  oracle   : 'https://mempool.space/signet',
  network  : 'signet'
}

export const testnet_config = {
  hostname : 'https://bitescrow-testnet.vercel.app',
  oracle   : 'https://mempool.space/testnet',
  network  : 'regtest'
}

export const client_config = regtest_config

export const client = new EscrowClient(client_config)
