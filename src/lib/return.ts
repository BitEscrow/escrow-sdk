import { Buff, Bytes }  from '@cmdcode/buff'
import { parse_addr }   from '@scrow/tapscript/address'
import { parse_proof }  from '@scrow/tapscript/tapkey'
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
  DepositContext,
  ReturnContext,
  SignerAPI,
  TxOutput
} from '../types/index.js'

import * as assert from '../assert.js'

const MIN_RECOVER_FEE = 1000

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
  address  : string,
  context  : DepositContext,
  signer   : SignerAPI,
  txout    : TxOutput,
  txfee = MIN_RECOVER_FEE
) : string {
  const { sequence, tap_data }        = context
  const { cblock, extension, script } = tap_data
  assert.ok(txout.value > txfee, 'tx value does not cover txfee')
  assert.exists(script)
  const scriptkey = parse_addr(address).asm
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
