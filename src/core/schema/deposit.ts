import { z } from 'zod'
import acct  from './account.js'
import base  from './base.js'
import tx    from './tx.js'

const { bool, hash, hex, network, num, stamp, str } = base

const locktime = z.union([ str, num ]).transform(e => Number(e))
const status   = z.enum([ 'registered', 'confirmed', 'locked', 'spent', 'settled', 'expired', 'error' ])

const lock_req = z.object({
  dpid     : hash,
  covenant : acct.covenant
})

const close_req = z.object({
  dpid        : hash,
  feerate     : num,
  return_psig : hex
})

const close_info = z.object({
  closed      : bool,
  closed_at   : stamp.nullable(),
  return_txid : hash.nullable()
})

const dp_open = z.object({
  closed      : z.literal(false),
  closed_at   : z.null(),
  return_txid : z.null()
})

const dp_closed = z.object({
  closed      : z.literal(true),
  closed_at   : stamp,
  return_txid : hash
})

const lock_info = z.object({
  locked    : bool,
  locked_at : stamp.nullable(),
  covenant  : acct.covenant.nullable()
})

const dp_unlocked = z.object({
  locked    : z.literal(false),
  locked_at : z.null(),
  covenant  : z.null()
})

const dp_locked = z.object({
  locked    : z.literal(true),
  locked_at : stamp,
  covenant  : acct.covenant
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
  acct_hash    : hash,
  created_at   : stamp,
  dpid         : hash,
  deposit_pk   : hash,
  deposit_addr : str,
  feerate      : num,
  locktime     : num,
  network,
  return_addr  : str,
  return_psig  : hex,
  satpoint     : str,
  server_pk    : hash,
  server_tkn   : hex,
  sigs         : z.tuple([ status, hex ]).array(),
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
