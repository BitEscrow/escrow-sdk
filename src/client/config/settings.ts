export default {
  main : {
    oracle_url : 'https://mempool.space',
    server_pk  : '',
    server_url : 'https://bitescrow.vercel.app',
    network    : 'main'
  },

  mutiny : {
    oracle_url : 'https://mutinynet.com',
    server_pk  : '87897fe76aade014e160833e47fc257d11ac22e1fde2e42901e876ca7a640d02',
    server_url : 'https://bitescrow-mutiny.vercel.app',
    network    : 'mutiny'
  },

  regtest : {
    oracle_url : 'http://localhost:3002',
    server_pk  : '33f9d5a021afdffb864153eefa5d353d53e2d22053dadf8577c0e2b524bac794',
    server_url : 'http://localhost:3001',
    network    : 'regtest'
  },

  signet : {
    oracle_url : 'https://mempool.space/signet',
    server_pk  : '',
    server_url : 'https://bitescrow-signet.vercel.app',
    network    : 'signet'
  },

  testnet : {
    oracle_url : 'https://mempool.space/testnet',
    server_pk  : '',
    server_url : 'https://bitescrow-testnet.vercel.app',
    network    : 'testnet'
  }
}
