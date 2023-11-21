import { Buff, Bytes }  from '@cmdcode/buff'
import { parse_addr }   from '@scrow/tapscript/address'
import { parse_proof }  from '@scrow/tapscript/tapkey'
import { Signer }       from '../signer.js'
import { base }         from '../schema/index.js'

import {
  create_txinput,
  sign_tx
} from './tx.js'

import {
  ScriptWord,
  SigHashOptions,
  TxBytes
} from '@scrow/tapscript'

import {
  create_tx,
  encode_tx,
  parse_tx
} from '@scrow/tapscript/tx'

import {
  DepositConfig,
  DepositContext,
  ReturnContext,
  SpendOut
} from '../types/index.js'

import * as assert from '../assert.js'

const MIN_RECOVER_FEE = 10000

/**
 * Computes and returns a context 
 * object from a given transaction.
 */
export function get_return_ctx (
  txhex : TxBytes
) : ReturnContext {
  const tx   = parse_tx(txhex)
  const txin = tx.vin.at(0)
  assert.exists(txin)
  const proof = parse_proof(txin.witness)
  const { params, script, tapkey } = proof
  const pub = script.at(3)
  const seq = script.at(0)
  const sig = params.at(0)
  assert.exists(pub)
  assert.exists(seq)
  assert.exists(sig)
  const sequence  = Buff.hex(seq).reverse().num
  const signature = Buff.bytes(sig).hex
  return { pubkey : pub, sequence, signature, tapkey, tx }
}

/**
 * Returns an asm-formatted locking script
 * using the provided input arguments.
 */
export function get_return_script (
  return_key : Bytes,
  sequence   : number
) {
  return [
    Buff.num(sequence, 4).reverse().hex,
    'OP_CHECKSEQUENCEVERIFY',
    'OP_DROP',
    Buff.bytes(return_key).hex,
    'OP_CHECKSIG'
  ]
}

/**
 * Create and sign a return transaction
 * for a given unspent transaction output.
 */
export function create_return_tx (
  context  : DepositContext,
  signer   : Signer,
  txout    : SpendOut,
  options  : Partial<DepositConfig> = {}
) : string {
  const { sequence, tap_data }        = context
  const { cblock, extension, script } = tap_data
  const { txfee = MIN_RECOVER_FEE }   = options
  assert.ok(txout.value > txfee, 'tx value does not cover txfee')
  assert.exists(script)
  const scriptkey = create_script_key(signer, options)
  const txin      = create_txinput(txout)
  const return_tx = create_tx({
    vin  : [{ ...txin, sequence }],
    vout : [{
      value        : txout.value - txfee,
      scriptPubKey : scriptkey
    }]
  })
  const opt : SigHashOptions = { extension, pubkey: signer.pubkey, txindex : 0, throws: true }
  const sig = sign_tx(signer, return_tx, opt)
  return_tx.vin[0].witness = [ sig, script, cblock ]
  // assert.ok(taproot.verify_tx(recover_tx, opt), 'recovery tx failed to generate!')
  return encode_tx(return_tx).hex
}

/**
 * Create a transaction output locking script
 * based on the provided config options.
 */
export function create_script_key (
  signer  : Signer,
  options : Partial<DepositConfig>
) {
  const { address, pubkey } = options
  let script_key : ScriptWord[]
  if (address !== undefined) {
    script_key = parse_addr(address).asm
  } else if (pubkey !== undefined) {
    script_key = [ 'OP_1', pubkey ]
  } else {
    script_key = [ 'OP_1', signer.pubkey ]
  }
  return script_key
}

/**
 * Parse and return the public key that is
 * contained in a transaction locking script.
 */
export function parse_return_key (words : ScriptWord[]) {
  const pubkey = words.at(3)
  if (pubkey === undefined) return null
  try {
    return base.hash.parse(pubkey)
  } catch {
    return null
  }
}

// export function scan_return_tx (
//   signer : Signer,
//   txdata : TxBytes | TxData
// ) {
//   const { vin, vout } = parse_tx(txdata)
//   for (let idx = 0; idx < vin.length; idx++) {
//     const txout   = vout[idx]
//     const txin    = vin[idx]
//     const scrkey  = parse_script(txout.scriptPubKey).key
//     if (scrkey === undefined) { continue }
//     const witdata = parse_witness(txin.witness)
//     if (witdata.script === null) { continue }
//     const redeem  = parse_script(witdata.script)
//     const pubkey  = parse_return_key(redeem.asm)
//     if (pubkey === null) { continue }
//     const retkey  = create_script_key(signer, { pubkey })
//     if (retkey[1] === scrkey.hex) {
//       const [ sig ] = witdata.params
//       const txid    = parse_txid(txdata)
//       const txinput = create_prevout({ txid, vout : idx, prevout : txout })
//       return { pubkey, sig, txinput }
//     }
//   }
//   return null
// }

// export function sweep_recovery_tx (
//   address : string,
//   signer  : Signer,
//   txinput : TxBytes | TxData,
//   txfee = 0
// ) {
//   // Extract the pubkey from script, and sig from witness.
//   // Use secret to recover the private key
//   // create a sweep tx using the address
//   const tx       = parse_tx(txdata)
//   const witness  = parse_witness(tx.vin[txindex].witness)
//   const prevout  = tx.vout[txindex]
//   const txid     = parse_txid(txdata)
//   const input    = create_prevout({ txid, prevout, vout : txindex })
//   const sweep_tx = create_tx({
//     vin  : [ input ],
//     vout : [{
//       value : prevout.value - BigInt(txfee),
//       scriptPubKey : parse_addr(address).script
//     }]
//   })
//   // need signer.recover() and signer.can_recover()
//   /* 
//     can recover:
//       - perform ecdh with key from txinput.
//       - hash shared secret.
//       - tweak key from txinput with shared hash.
//       - if tweaked key matches output key, then is recoverable.
//   */
//   recover_key
// }
