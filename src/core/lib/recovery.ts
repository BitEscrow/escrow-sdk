import { Buff, Bytes } from '@cmdcode/buff'
import { parse_addr }  from '@scrow/tapscript/address'
import { parse_proof } from '@scrow/tapscript/tapkey'

import BaseSchema from '@/schema.js'

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
  AccountContext,
  ReturnContext,
  SignerAPI,
  TxOutput
} from '../types/index.js'

import * as assert from '@/assert.js'

const MIN_RECOVER_FEE = 1000

/**
 * Computes and returns a context
 * object from a given transaction.
 */
export function get_recovery_ctx (
  txhex : TxBytes
) : ReturnContext {
  // Parse the transaction hex.
  const tx   = parse_tx(txhex)
  // Define the first input of the tx.
  const txin = tx.vin.at(0)
  // Assert that an input exists.
  assert.exists(txin)
  // Parse the input witness for context.
  const wit_ctx = parse_proof(txin.witness)
  // Unpack the context object
  const { params, script, tapkey } = wit_ctx
  // Define the sequence value.
  const seq = script.at(0)
  // Define variables for the pubkey and signature.
  let pub : Bytes | undefined, sig : Bytes | undefined
  // Parse the script based on its content.
  if (script.includes('OP_HASH160')) {
    pub = params.at(0)
    sig = params.at(1)
  } else if (script.length === 5) {
    pub = script.at(3)
    sig = params.at(0)
  } else {
    throw new Error('Invalid witness script: ' + script.toString())
  }
  // Assert that all parsed values exist.
  assert.exists(seq)
  assert.exists(pub)
  assert.exists(sig)
  // Format the parsed values.
  const pubkey    = Buff.bytes(pub).hex
  const sequence  = Buff.hex(seq).reverse().num
  const signature = Buff.bytes(sig).hex
  // Return the parsed values.
  return { pubkey, sequence, signature, tapkey, tx }
}

/**
 * Returns an asm-formatted locking script
 * using the provided input arguments.
 */
export function get_recovery_script (
  return_addr : string,
  sequence    : number
) {
  // Parse the address and return the context.
  const addr = parse_addr(return_addr)
  // Define a variable for the script.
  let script : string[]
  // Configure the script based on the address type.
  if (addr.type === 'p2pkh' || addr.type === 'p2w-pkh') {
    script = [ 'OP_DUP', 'OP_HASH160', addr.key, 'OP_EQUALVERIFY' ]
  } else if (addr.type === 'p2tr') {
    script = [ addr.key ]
  } else {
    throw new Error('Invalid address type: ' + addr.type)
  }
  // Return the recovery script.
  return [
    Buff.num(sequence, 4).reverse().hex,
    'OP_CHECKSEQUENCEVERIFY',
    'OP_DROP',
    ...script,
    'OP_CHECKSIG'
  ]
}

/**
 * Create and sign a recovery transaction
 * for a given unspent transaction output.
 */
export function create_recovery_tx (
  address : string,
  context : AccountContext,
  signer  : SignerAPI,
  txout   : TxOutput,
  txfee = MIN_RECOVER_FEE
) : string {
  const { sequence, tap_data } = context
  const { cblock, extension, script } = tap_data
  assert.ok(txout.value > txfee, 'tx value does not cover txfee')
  assert.exists(script)
  const tx_input  = create_txinput(txout)
  const return_tx = create_tx({
    vin  : [ { ...tx_input, sequence } ],
    vout : [ {
      value        : txout.value - txfee,
      scriptPubKey : parse_addr(address).asm
    } ]
  })

  const opt : SigHashOptions = { extension, txindex: 0, throws: true }
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
    return BaseSchema.hash.parse(pubkey)
  } catch {
    return null
  }
}
