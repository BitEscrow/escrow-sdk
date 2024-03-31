import { Buff }           from '@cmdcode/buff'
import { Signer, Wallet } from '@cmdcode/signer'
import { CoreSigner }     from './types.js'

import {
  CoreClient,
  CoreConfig,
  CoreDaemon
} from '@cmdcode/core-cmd'

const DEFAULT_CONFIG : Partial<CoreConfig> = {
  corepath : 'test/bin/bitcoind',
  clipath  : 'test/bin/bitcoin-cli',
  confpath : 'test/regtest.conf',
  datapath : 'test/data',
  network  : 'regtest',
  isolated : true,
  verbose  : false,
  core_params : [ '-reindex' ]
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

export async function get_members (
  client  : CoreClient,
  aliases : string[]
) {
  const members = aliases.map(e => get_signer(client, e))
  return Promise.all(members)
}

export async function get_signer (
  client : CoreClient,
  label  : string
) : Promise<CoreSigner> {
  const seed = Buff.str(label).digest
  const wdat = await client.load_wallet(label)
  const xpub = await wdat.xpub
  return {
    alias  : label,
    core   : wdat,
    signer : new Signer({ seed }),
    wallet : new Wallet(xpub)
  }
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
  mine_block = false
) : Promise<string> {
    const wallet = await client.load_wallet(label)
    await wallet.ensure_funds(value)
    return wallet.send_funds(value, address, mine_block)
}

export async function get_utxo (
  cli  : CoreClient,
  addr : string,
  txid : string
) {
  const tx = await cli.get_tx(txid)
  
  if (tx === null) {
    throw new Error('tx not found')
  }

  const vout = tx.vout.findIndex(txo => txo.scriptPubKey.address === addr)
  
  if (vout === -1) {
    throw new Error('vout not found in tx')
  }

  const { value, scriptPubKey } = tx.vout[vout]
  return { txid, vout, value, scriptkey : scriptPubKey.hex }
}
