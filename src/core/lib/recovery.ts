import { Buff }        from '@cmdcode/buff'
import { get_key_ctx } from '@cmdcode/musig2'
import { parse_addr }  from '@scrow/tapscript/address'
import { taproot }     from '@scrow/tapscript/sighash'
import { TxData }      from '@scrow/tapscript'

import {
  create_sequence,
  create_tx,
  encode_tx
} from '@scrow/tapscript/tx'

import * as assert from '@/assert.js'

import { parse_session_token } from './session.js'

import {
  create_txinput,
  get_tapkey,
  sign_tx
} from './tx.js'

import {
  AccountTemplate,
  RecoveryConfig,
  RecoveryContext,
  SignerAPI,
  TxOutput
} from '../types/index.js'

const DUST_LIMIT      = 520
const RECOVERY_TXSIZE = 118

/**
 * Create and sign a recovery transaction
 * for a given unspent transaction output.
 */
export function get_recovery_tx (
  config    : RecoveryConfig,
  feerate   : number,
  recv_addr : string,
  signer    : SignerAPI,
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
  const recover_tx = create_tx({
    vin  : [ { ...tx_input, sequence: ctx.sequence } ],
    vout : [ {
      value        : utxo.value - txfee,
      scriptPubKey : parse_addr(recv_addr).asm
    } ]
  })
  // Sign the recovery transaction.
  const signed_tx = sign_recovery_tx(ctx, signer, recover_tx)
  // Return the completed transaction as hex.
  return encode_tx(signed_tx).hex
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
  const members      = [ deposit_pk, agent_pk ]
  // Get the context of the return address.
  const pubkey       = parse_addr(return_addr).key
  // Get the sequence value from the locktime.
  const sequence     = create_sequence('stamp', locktime)
  // Get the recovery script path.
  const script       = get_recovery_script(pubkey, sequence)
  // Get the musig context for the internal key.
  const int_data     = get_key_ctx(members)
  // Get the key data for the taproot key.
  const tap_data     = get_tapkey(int_data.group_pubkey.hex, script)
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
  ctx    : RecoveryContext,
  signer : SignerAPI,
  txdata : TxData
) {
  // Get recovery context object.
  const { cblock, extension, script } = ctx
  // Configure the signature session.
  const opt = { extension, txindex: 0, throws: true }
  // We may need to add a naked tap tweak??
  // Create a signature for the transaction.
  const sig = sign_tx(signer, txdata, opt)
  // Apply the params and proof to the witness.
  txdata.vin[0].witness = [ sig, script, cblock ]
  // Verify that the tx is signed correctly.
  taproot.verify_tx(txdata, opt)
  // Return the completed transaction data.
  return txdata
}
