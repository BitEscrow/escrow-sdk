const mutiny = {
  client : {
    hostname : 'https://bitescrow-mutiny.vercel.app',
    oracle   : 'https://mutinynet.com',
    network  : 'signet'
  },
  core : {
    debug    : true,
    network  : 'signet',
    rpc_user : 'mutiny',
    rpc_pass : 'uPCV8g5VGgf96P',
    verbose  : true
  }
}

const regtest = {
  client  : {
    hostname : 'http://localhost:3000',
    oracle   : 'http://172.21.0.3:3300',
    network  : 'regtest'
  },
  core : {
    debug   : true,
    network : 'regtest',
    verbose : true
  }
}

const staging = {
  client : {
    hostname : 'https://bitescrow.vercel.app',
    oracle   : 'https://mempool.space',
    network  : 'main'
  },
  core : {
    debug   : true,
    network : 'main',
    verbose : true
  }
}

const testnet = {
  client : {
    hostname : 'https://bitescrow-testnet.vercel.app',
    oracle   : 'https://mempool.space/testnet',
    network  : 'testnet'
  },
  core : {
    debug   : true,
    network : 'testnet',
    verbose : true
  }
}

export default { mutiny, regtest, staging, testnet }
