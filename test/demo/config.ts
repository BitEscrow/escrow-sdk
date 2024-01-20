const regtest = {
  client  : {
    hostname : 'http://localhost:3000',
    oracle   : 'http://172.21.0.3:3300',
    network  : 'regtest'
  },
  core : {
    debug   : true,
    network : 'regtest',
    spawn   : false
  }
}

const mutiny = {
  client : {
    hostname : 'https://bitescrow-mutiny.vercel.app',
    oracle   : 'https://mutinynet.com',
    network  : 'signet'
  },
  core : {
    cli_params  : [ '-rpcuser=mutiny', '-rpcpassword=uPCV8g5VGgf96P' ],
    debug       : true,
    network     : 'signet',
    spawn       : false,
    verbose     : true
  }
}

const testnet = {
  client : {
    hostname : 'https://bitescrow-testnet.vercel.app',
    oracle   : 'https://mempool.space/testnet',
    network  : 'testnet'
  },
  core : {
    cli_params  : [ '-rpcuser=testnet', '-rpcpassword=bitcoin' ],
    debug       : true,
    network     : 'testnet',
    spawn       : false,
    verbose     : true
  }
}

export default { mutiny, regtest, testnet }
