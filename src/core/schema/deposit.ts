import { z } from 'zod'
import acct  from './account.js'
import base  from './base.js'
import tx    from './tx.js'

const { bool, hash, hex, network, num, stamp, str } = base

const locktime = z.union([ str, num ]).transform(e => Number(e))
const status   = z.enum([ 'registered', 'confirmed', 'locked', 'spent', 'settled', 'closed', 'expired', 'error' ])

const lock_req = z.object({
  dpid     : hash,
  covenant : acct.covenant
})

const close_req = z.object({
  dpid        : hash,
  return_rate : num,
  return_psig : hex
})

const close_info = z.object({
  closed       : bool,
  closed_at    : stamp.nullable(),
  closed_sig   : hex.nullable(),
  return_txhex : hex.nullable(),
  return_txid  : hash.nullable()
})

const dp_open = z.object({
  closed       : z.literal(false),
  closed_at    : z.null(),
  closed_sig   : z.null(),
  return_txhex : z.null(),
  return_txid  : z.null()
})

const dp_closed = z.object({
  closed       : z.literal(true),
  closed_at    : stamp,
  closed_sig   : hex,
  return_txhex : hex,
  return_txid  : hash
})

const lock_info = z.object({
  locked     : bool,
  locked_at  : stamp.nullable(),
  locked_sig : hex.nullable(),
  covenant   : acct.covenant.nullable()
})

const dp_unlocked = z.object({
  locked     : z.literal(false),
  locked_at  : z.null(),
  locked_sig : z.null(),
  covenant   : z.null()
})

const dp_locked = z.object({
  locked     : z.literal(true),
  locked_at  : stamp,
  locked_sig : hex,
  covenant   : acct.covenant
})

const lock_state  = z.discriminatedUnion('locked', [ dp_locked, dp_unlocked ])
const close_state = z.discriminatedUnion('closed', [ dp_closed, dp_open ])

const fund = z.object({
  covenant   : acct.covenant.nullable(),
  status,
  updated_at : stamp,
  utxo       : tx.txout
}).and(tx.confirm_state).and(tx.spend_state).and(tx.settle_state)

const base_data = z.object({
  status,
  account_hash : hash,
  agent_pk     : hash,
  agent_sig    : hex,
  agent_tkn    : hex,
  created_at   : stamp,
  dpid         : hash,
  deposit_pk   : hash,
  deposit_addr : str,
  locktime     : num,
  network,
  return_addr  : str,
  return_psig  : hex,
  return_rate  : num,
  satpoint     : str,
  updated_at   : stamp,
  utxo         : tx.txout
})

const data  = base_data
  .and(tx.confirm_state)
  .and(lock_state)
  .and(close_state)
  .and(tx.spend_state)
  .and(tx.settle_state)

const shape = base_data
  .merge(tx.confirm_info)
  .merge(lock_info)
  .merge(close_info)
  .merge(tx.spend_info)
  .merge(tx.settle_info)

export default {
  close_req,
  data,
  fund,
  locktime,
  lock_req,
  shape,
  status
}
