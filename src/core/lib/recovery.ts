/* Global Imports */

import { Buff }        from '@cmdcode/buff'
import { get_key_ctx } from '@cmdcode/musig2'
import { parse_addr }  from '@scrow/tapscript/address'
import { taproot }     from '@scrow/tapscript/sighash'

import {
  create_sequence,
  create_tx,
  decode_tx,
  encode_tx
} from '@scrow/tapscript/tx'

/* Modules Imports */

import { assert } from '@/util/index.js'

import {
  AccountTemplate,
  RecoveryConfig,
  RecoveryContext,
  SignerAPI,
  TxOutput
} from '../types/index.js'

/* Local Imports */

import { parse_session_token } from './session.js'

import {
  create_txinput,
  get_tapkey,
  sign_tx
} from './tx.js'

const DUST_LIMIT      = 520
const RECOVERY_TXSIZE = 118

/**
 * Create a recovery transaction template
 * for a given unspent transaction output.
 */
export function get_recovery_tx (
  config    : RecoveryConfig,
  feerate   : number,
  recv_addr : string,
  utxo      : TxOutput
) : string {
  // Get recovery context object.
  const ctx = get_recovery_ctx(config)
  // Calculate the transaction fee.
  const txfee = RECOVERY_TXSIZE * feerate
  // Assert the transaction is above the dust limit.
  assert.ok((utxo.value - txfee) >= DUST_LIMIT, 'tx value + fee is below dust limit')
  // Convert utxo into a txinput.
  const tx_input  = create_txinput(utxo)
  // Create the return transaction.
  const recovery_tx = create_tx({
    vin  : [ { ...tx_input, sequence: ctx.sequence } ],
    vout : [ {
      value        : utxo.value - txfee,
      scriptPubKey : parse_addr(recv_addr).asm
    } ]
  })
  // Return the transaction template as hex.
  return encode_tx(recovery_tx, false).hex
}

/**
 * Get a recovery config object from
 * an existing deposit account object.
 */
export function get_recovery_config (
  account : AccountTemplate
) : RecoveryConfig {
  const { agent_tkn, deposit_pk, locktime, network, return_addr } = account
  const session = parse_session_token(agent_tkn)
  return { agent_pk: session.pk, deposit_pk, locktime, network, return_addr }
}

/**
 * Get a context object for creating
 * a deposit recovery transaction.
 */
export function get_recovery_ctx (
  config : RecoveryConfig
) : RecoveryContext {
  const { agent_pk, deposit_pk, locktime, return_addr } = config
  // Define the members of the multi-sig.
  const members  = [ deposit_pk, agent_pk ]
  // Get the context of the return address.
  const pubkey   = parse_addr(return_addr).key
  // Get the sequence value from the locktime.
  const sequence = create_sequence('stamp', locktime)
  // Get the recovery script path.
  const script   = get_recovery_script(pubkey, sequence)
  // Get the musig context for the internal key.
  const int_data = get_key_ctx(members)
  // Get the key data for the taproot key.
  const tap_data = get_tapkey(int_data.group_pubkey.hex, script)
  // Unpack the tap_data object,
  const { cblock, extension } = tap_data
  // Return the recovery context object.
  return { cblock, extension, pubkey, script, sequence }
}

/**
 * Returns an asm-formatted locking script
 * using the provided input arguments.
 */
export function get_recovery_script (
  pubkey   : string,
  sequence : number
) {
  // Return the recovery script.
  return [
    Buff.num(sequence, 4).reverse().hex,
    'OP_CHECKSEQUENCEVERIFY',
    'OP_DROP',
    pubkey,
    'OP_CHECKSIG'
  ]
}

/**
 * Returns a signed transaction object,
 * using the provided recovery context.
 */
export function sign_recovery_tx (
  config : RecoveryConfig,
  signer : SignerAPI,
  txhex  : string,
  utxo   : TxOutput
) {
  // Get recovery context object.
  const ctx = get_recovery_ctx(config)
  // Get recovery context object.
  const { cblock, extension, script } = ctx
  // Configure the signature session.
  const opt = { extension, txindex: 0, throws: true }
  // NOTE: We may need to add a naked tap tweak??
  // Decode the return transaction.
  const txdata = decode_tx(txhex)
  // Add the prevout data to the tx input.
  txdata.vin[0].prevout = create_txinput(utxo).prevout
  // Create a signature for the transaction.
  const sig = sign_tx(signer, txdata, opt)
  // Apply the params and proof to the witness.
  txdata.vin[0].witness = [ sig, script, cblock ]
  // Verify that the tx is signed correctly.
  taproot.verify_tx(txdata, opt)
  // Return the completed transaction data.
  return encode_tx(txdata).hex
}
