/* Global Imports */

import { Buff }            from '@cmdcode/buff'
import { sha512 }          from '@cmdcode/crypto-tools/hash'
import { parse_addr }      from '@scrow/tapscript/address'
import { create_sequence } from '@scrow/tapscript/tx'

import {
  get_key_ctx,
  tweak_key_ctx
} from '@cmdcode/musig2'

/* Module Imports */

import {
  AccountContext,
  AccountRequest,
  ChainNetwork,
  SignerAPI,
  AccountTemplate,
  RegisterTemplate,
  DepositData
} from '../../types/index.js'

/* Local Imports */

import { get_recovery_script } from '../../lib/recovery.js'

import {
  get_address,
  get_tapkey,
  get_utxo_bytes
} from '../../lib/tx.js'

import {
  parse_session_token
} from '../../lib/session.js'

/**
 * Create an account context object.
 */
export function create_account_ctx (
  deposit_pk  : string,
  locktime    : number,
  network     : ChainNetwork,
  return_addr : string,
  token       : string
) : AccountContext {
  // Parse the session token.
  const session      = parse_session_token(token)
  // Define the members of the multi-sig.
  const members      = [ deposit_pk, session.pk ]
  // Get the sequence value from the locktime.
  const sequence     = create_sequence('stamp', locktime)
  // Get the context of the return address.
  const addr_ctx     = parse_addr(return_addr)
  // Get the recovery script path.
  const script       = get_recovery_script(addr_ctx.key, sequence)
  // Get the musig context for the internal key.
  const int_data     = get_key_ctx(members)
  // Get the key data for the taproot key.
  const tap_data     = get_tapkey(int_data.group_pubkey.hex, script)
  // Get the musig context for the tap-tweaked key.
  const key_data     = tweak_key_ctx(int_data, [ tap_data.taptweak ])
  // Get the deposit address from the taproot data.
  const deposit_addr = get_address(tap_data.tapkey, addr_ctx.network)
  // Ensure that the return address is a taproot address.
  if (addr_ctx.type !== 'p2tr') {
    throw new Error('only taproot addresses are valid for recovery')
  }
  // Return context object.
  return { deposit_addr, deposit_pk, key_data, network, return_addr, script, sequence, session, tap_data }
}

/**
 * Get the context object from an existing account.
 */
export function get_account_ctx (template : AccountTemplate) {
  // Unpack the account object.
  const { deposit_pk, locktime, network, return_addr, agent_tkn } = template
  // Return the account context object.
  return create_account_ctx(deposit_pk, locktime, network, return_addr, agent_tkn)
}

/**
 * Get the hash identifier for an account reqeust.
 */
export function get_account_hash (
  request : AccountRequest
) : string {
  const { deposit_pk, locktime, network, return_addr } = request
  const net = Buff.str(network)
  const pub = Buff.bytes(deposit_pk)
  const seq = Buff.num(locktime, 4)
  const rta = Buff.str(return_addr)
  return Buff.join([ net, pub, seq, rta ]).digest.hex
}

export function get_deposit_hash (
  request : RegisterTemplate | DepositData
) {
  const hash = get_account_hash(request)
  const agnt = Buff.hex(request.agent_tkn)
  const rate = Buff.num(request.return_rate, 4)
  const utxo = get_utxo_bytes(request.utxo)
  const pimg = Buff.join([ hash, agnt, rate, utxo ])
  return sha512(pimg).hex
}

/**
 * Get the account id for a deposit account.
 */
export function get_account_id (
  address  : string,
  reqhash  : string,
  pubkey   : string,
  stamp    : number,
  token    : string
) : string {
  const addr = Buff.str(address)
  const hash = Buff.hex(reqhash)
  const pub  = Buff.hex(pubkey)
  const stmp = Buff.num(stamp, 4)
  const tkn  = Buff.hex(token)
  return Buff.join([ addr, hash, pub, stmp, tkn ]).digest.hex
}

export function get_account_agent (
  request   : AccountRequest,
  agent : SignerAPI
) {
  // Get account request hash.
  const hash = get_account_hash(request)
  // Get signing agent for account.
  return agent.get_id(hash)
}
