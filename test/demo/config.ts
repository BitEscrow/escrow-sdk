const regtest = {
  client  : {
    hostname : 'http://localhost:3000',
    oracle   : 'http://172.21.0.3:3300'
  },
  core : {
    network : 'regtest',
    spawn   : false
  }
}

const localtest = {
  client  : {
    hostname : 'http://localhost:3000',
    oracle   : 'http://172.21.0.3:3300'
  },
  core : {
    core_params : [ '-addnode=172.21.0.3:18442' ],
    corepath    : 'test/bin/core/bitcoind',
    clipath     : 'test/bin/core/bitcoin-cli',
    confpath    : 'test/conf/regtest.conf',
    datapath    : 'test/data/demo',
    init_delay  : 2,
    network     : 'regtest',
    debug       : true,
    spawn       : true,
    verbose     : true
  }
}

const mutiny = {
  client : {
    hostname : 'https://bitescrow-mutiny.vercel.app',
    oracle   : 'https://mutinynet.com'
  },
  core : {
    cli_params  : [ '-rpcuser=mutiny', '-rpcpassword=uPCV8g5VGgf96P' ],
    debug       : true,
    network     : 'signet',
    spawn       : false,
    verbose     : true
  }
}

export default { localtest, mutiny, regtest }