import { assert, Signer } from '@scrow/core'

import {
  CoreClient,
  CoreConfig,
  CoreDaemon
} from '@cmdcode/core-cmd'

import { MemberData } from './types.js'

const DEFAULT_CONFIG = {
  core_params : [ '-txindex' ],
  corepath    : 'test/bin/bitcoind',
  clipath     : 'test/bin/bitcoin-cli',
  confpath    : 'test/bitcoin.conf',
  datapath    : 'test/data',
  network     : 'regtest',
  isolated    : true,
  debug       : false,
  verbose     : false
}

let daemon : CoreDaemon | null = null

export function get_daemon (
  config : Partial<CoreConfig> = DEFAULT_CONFIG
) : CoreDaemon {
  if (daemon === null) {
    daemon = new CoreDaemon(config)
  }
  return daemon
}

export function get_users (
  cli    : CoreClient,
  labels : string[]
) : Promise<MemberData[]> {
  const users = labels.map(async label => {
    return {
      label,
      signer : Signer.seed(label),
      wallet : await cli.load_wallet(label)
    }
  })
  return Promise.all(users)
}

export async function get_utxo (
  cli  : CoreClient,
  addr : string,
  txid : string
) {
  const tx = await cli.get_tx(txid)
  assert.exists(tx)
  const vout = tx.vout.findIndex(txo => txo.scriptPubKey.address === addr)
  assert.ok(vout !== -1, 'tx output not found')
  const { value, scriptPubKey } = tx.vout[vout]
  return { txid, vout, value, scriptkey : scriptPubKey.hex }
}