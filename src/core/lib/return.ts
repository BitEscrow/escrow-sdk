/* Global Imports */

import { Buff }          from '@cmdcode/buff'
import { combine_psigs } from '@cmdcode/musig2'
import { TxData }        from '@scrow/tapscript'
import { encode_tx }     from '@scrow/tapscript/tx'

/* Local Imports */

import { RETURN_TX_VSIZE }    from '../const.js'
import { get_session_pnonce } from './session.js'

import {
  CovenantSession,
  RegisterRequest,
  RegisterTemplate,
  SignerAPI
} from '../types/index.js'

import {
  get_account_agent,
  get_account_ctx,
  get_deposit_hash
} from '../module/account/util.js'

import {
  create_covenant_psig,
  get_covenant_session,
  settle_covenant_psig
} from './covenant.js'

import {
  create_utxo_template,
  create_txinput,
  get_lock_script
} from './tx.js'

/**
 * Compute a musig context object for
 * collaboratively closing a deposit.
 */
export function get_return_session (
  pnonce  : string,
  request : RegisterTemplate,
  txdata  : TxData
) : CovenantSession {
  // Get a context object for the deposit.
  const ctx   = get_account_ctx(request)
  // Get the hash digest of the deposit.
  const hash  = get_deposit_hash(request)
  // Get the txhex of the transaction template.
  const txhex = encode_tx(txdata).hex
  // Create and return a musig context object with the txinput.
  return get_covenant_session(ctx, hash, txhex, pnonce, request.utxo)
}

/**
 * Create a partial signature for
 * collaboratively closing a deposit.
 */
export function create_return_psig (
  request : RegisterTemplate,
  signer  : SignerAPI
) : string {
  // Compute the deposit request hash.
  const hash    = get_deposit_hash(request)
  // Compute the session pnonce value.
  const pnonce  = get_session_pnonce(hash, signer).hex
  // Create a return transaction using the provided params.
  const txdata  = create_return_template(request)
  // Compute a musig context object for the transaction.
  const session = get_return_session(pnonce, request, txdata)
  // Create a partial signature using the musig context.
  const psig    = create_covenant_psig(session, signer)
  // Return the pnonce and psig.
  return Buff.join([ pnonce, psig ]).hex
}

/**
 * Create a transaction template for
 * collaboratively closing a deposit.
 */
export function create_return_template (
  request : RegisterTemplate
) : TxData {
  const { return_addr, return_rate, utxo } = request
  // Get fee amount.
  const txfees = get_return_txfee(return_rate)
  // Create locking script.
  const script = get_lock_script(return_addr)
  // Create a return transaction using the provided params.
  return create_utxo_template(script, utxo.value - txfees)
}

/**
 * Complete a settlement transaction
 * for closing an escrow deposit.
 */
export function get_return_tx (
  request : RegisterRequest,
  signer  : SignerAPI
) : string {
  const { return_psig, utxo } = request
  // Parse the pnonce from the return psig.
  const [ pnonce, dp_psig ] = parse_return_psig(return_psig)
  // Create a transaction template from the request.
  const txdata  = create_return_template(request)
  // Compute a musig context object for the transaction.
  const session = get_return_session(pnonce.hex, request, txdata)
  // Get signing agent for account.
  const agent   = get_account_agent(request, signer)
  // Compute the partial signature for the signer.
  const ag_psig = settle_covenant_psig(session, agent)
  // Compute the combined signature.
  const musig   = combine_psigs(session.musig, [ dp_psig, ag_psig ])
  // Format the signature for ANYONECANPAY_SIGHASH_SINGLE.
  const sig     = musig.append(0x81).hex
  // Format the unspent tx output as an input.
  const vin     = create_txinput(utxo)
  // Append the input to the trnasaction template
  txdata.vin.push({ ...vin, witness: [ sig ] })
  // Return the transaction encoded as hex.
  return encode_tx(txdata).hex
}

export function parse_return_psig (return_psig : string) {
  //
  const pbytes  = Buff.hex(return_psig)
  //
  const pnonce  = pbytes.subarray(0, 64)
  //
  const psig    = pbytes.subarray(64)
  //
  return [ pnonce, psig ]
}

/**
 * Get the absoulute txfee for a return
 * transaction, based on the feerate.
 */
export function get_return_txfee (feerate : number) : number {
  return feerate * RETURN_TX_VSIZE
}
