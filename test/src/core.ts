import { assert } from '@scrow/core'
import { Wallet } from '@cmdcode/signer'

import {
  CoreClient,
  CoreConfig,
  CoreDaemon
} from '@cmdcode/core-cmd'

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

export async function get_wallet (
  client : CoreClient,
  label  : string
) {
  const wdat = await client.load_wallet(label)
  const xpub = await wdat.xpub
  return new Wallet(xpub)
}

export async function fund_address (
  client  : CoreClient,
  label   : string,
  address : string,
  value   : number,
  mine_block = true
) : Promise<string> {
    const wdat = await client.load_wallet(label)
    await wdat.ensure_funds(value)
    return wdat.send_funds(value, address, mine_block)
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
