import { Buff, Bytes }  from '@cmdcode/buff'
import { hash256 }      from '@cmdcode/crypto-tools/hash'
import { taproot }      from '@scrow/tapscript/sighash'
import { parse_script } from '@scrow/tapscript/script'
import { tap_pubkey }   from '@scrow/tapscript/tapkey'

import { P2TR, parse_addr } from '@scrow/tapscript/address'

import {
  combine_psigs,
  MusigContext
} from '@cmdcode/musig2'

import {
  SigHashOptions,
  TapContext,
  TxBytes,
  TxData,
  TxPrevout
} from '@scrow/tapscript'

import {
  create_prevout,
  parse_sequence,
  create_tx,
  encode_tx,
  parse_tx,
  parse_txid,
  decode_tx,
  create_sequence,
  create_vout
} from '@scrow/tapscript/tx'

import { assert } from '../util/index.js'

import {
  TxConfirmState,
  Network,
  TxSettleState,
  SignerAPI,
  TxSpendState,
  TxOutput,
  TxVout
} from '../types/index.js'

/**
 * Initialization object for tx receive state.
 */
export function INIT_CONF_STATE () : TxConfirmState {
  return {
    confirmed    : false as const,
    block_hash   : null,
    block_height : null,
    block_time   : null,
    expires_at   : null
  }
}

/**
 * Initialization object for tx spend state.
 */
export function INIT_SPEND_STATE () : TxSpendState {
  return {
    spent       : false as const,
    spent_at    : null,
    spent_sig   : null,
    spent_txhex : null,
    spent_txid  : null
  }
}

/**
 * Initialization object for tx settle state.
 */
export function INIT_SETTLE_STATE () : TxSettleState {
  return {
    settled     : false as const,
    settled_at  : null,
    settled_sig : null
  }
}

export function create_timelock (
  duration : number
) {
  return create_sequence('stamp', duration)
}

export function get_address (
  tapkey   : Bytes,
  network ?: Network
) {
  if (network === 'mutiny') {
    network = 'signet'
  }
  return P2TR.encode(tapkey, network)
}

export function get_tapkey (
  pubkey : string,
  script : string[]
) : TapContext {
  return tap_pubkey(pubkey, { script })
}

export function get_txid (
  txdata : TxBytes | TxData
) {
  const json = parse_tx(txdata)
  const data = encode_tx(json, false)
  return hash256(data).reverse().hex
}

export function get_satpoint (
  utxo : TxOutput
) : string {
  return `${utxo.txid}:${String(utxo.vout)}`
}

export function create_txinput (
  txout : TxOutput
) : TxPrevout {
  const { txid, vout, value, scriptkey } = txout
  const prevout = { value, scriptPubKey: scriptkey }
  return create_prevout({ txid, vout, prevout })
}

export function parse_timelock (sequence : number) {
  const sdata    = parse_sequence(sequence)
  const timelock = sdata.stamp
  assert.ok(sdata.enabled,          'Timelock is not enabled.')
  assert.ok(sdata.type === 'stamp', 'Lock type is not a timelock.')
  assert.exists(timelock)
  return timelock
}

export function parse_prevout (
  txdata : TxBytes | TxData,
  tapkey : Bytes
) : TxPrevout | null {
  txdata = parse_tx(txdata)
  const vout = txdata.vout.findIndex(txout => {
    const { type, key } = parse_script(txout.scriptPubKey)
    return (
      type === 'p2tr'    &&
      key  !== undefined &&
      Buff.is_equal(key, tapkey)
    )
  })

  if (vout !== -1) {
    const txid    = parse_txid(txdata)
    const prevout = txdata.vout[vout]
    return create_prevout({ txid, vout, prevout })
  } else {
    return null
  }
}

export function get_utxo_bytes (utxo : TxOutput) {
  const txid  = Buff.hex(utxo.txid)
  const vout  = Buff.num(utxo.vout, 4)
  const value = Buff.num(utxo.value, 8)
  const skey  = Buff.hex(utxo.scriptkey)
  return Buff.join([ txid, vout, value, skey ])
}

export function get_signed_tx (
  ctx    : MusigContext,
  psigs  : string[],
  txdata : TxData
) {
  const signature = combine_psigs(ctx, psigs)
  txdata.vin[0].witness = [ signature ]
  taproot.verify_tx(txdata, { txindex: 0 })
  return encode_tx(txdata)
}

export function get_lock_script (address : string) {
  // Parse the address context.
  const ctx = parse_addr(address)
  // Return the matching script type.
  switch (ctx.type) {
    case 'p2pkh':
      return [ 'OP_DUP', 'OP_HASH160', ctx.key, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]
    case 'p2w-pkh':
      return [ 'OP_0', ctx.key ]
    case 'p2tr':
      return [ 'OP_1', ctx.key ]
    default:
      throw new Error('Invalid script type: ' + ctx.type)
  }
}

export function get_vout_txhex (vout : TxVout[]) : string {
  const txdata = create_tx({ vout })
  return encode_tx(txdata).hex
}

export function create_utxo_template (
  script : string[],
  value  : number
) : TxData {
  const txout = create_vout({ value, scriptPubKey: script })
  return create_tx({ vout: [ txout ] })
}

export function create_spend_template (
  addr  : string,
  txfee : number,
  value : number
) {
  // Get the locking script for the address.
  const script = get_lock_script(addr)
  // Return a transaction using the provided params.
  return create_utxo_template(script, value - txfee)
}

export function create_sighash (
  txhex : string,
  utxo  : TxOutput
) {
   // Create a txinput for the transaction.
  const txinput = create_txinput(utxo)
  const txdata  = decode_tx(txhex, false)
  return taproot.hash_tx(txdata, { sigflag: 0x81, txinput }).hex
}

export function sign_tx (
  signer  : SignerAPI,
  txdata  : TxBytes | TxData,
  config ?: SigHashOptions
) {
  // Set the signature flag type.
  const { sigflag = 0x00 } = config ?? {}
  // Calculate the transaction hash.
  const hash = taproot.hash_tx(txdata, config)
  // Sign the transaction hash with secret key.
  const sig  = signer.sign(hash)
  // Return the signature.
  return (sigflag === 0x00)
    ? sig
    : Buff.join([ sig, sigflag ]).hex
}
