import { z } from 'zod'
import base  from '@/schema.js'
import acct  from './account.js'
import cov   from './covenant.js'
import tx    from './tx.js'

const { bool, hash, hex, network, num, stamp, str } = base
const { close_state, settle_data, spend_data, spend_state, txspend } = tx

const locktime = z.union([ str, num ]).transform(e => Number(e))
const status   = z.enum([ 'reserved', 'pending', 'stale', 'open', 'locked', 'spent', 'settled', 'expired', 'error' ])

const register_req = acct.request.extend({
  agent_tkn   : cov.token,
  feerate     : num,
  network,
  return_psig : hex,
  utxo        : tx.txspend
})

const commit_req = register_req.extend({
  covenant : cov.data
})

const lock_req = z.object({
  dpid     : hash,
  covenant : cov.data
})

const close_req = z.object({
  dpid        : hash,
  feerate     : num,
  return_psig : hex
})

const deposit_data = z.object({
  confirmed    : bool,
  block_hash   : hash.nullable(),
  block_height : num.nullable(),
  block_time   : stamp.nullable(),
  expires_at   : stamp.nullable()
})

const confirmed = z.object({
  confirmed    : z.literal(true),
  block_hash   : hash,
  block_height : num,
  block_time   : stamp,
  expires_at   : stamp
})

const unconfirmed = z.object({
  confirmed    : z.literal(false),
  block_hash   : z.null(),
  block_height : z.null(),
  block_time   : z.null(),
  expires_at   : z.null()
})

const deposit_state = z.discriminatedUnion('confirmed', [ confirmed, unconfirmed ])

const digest = z.object({
  covenant   : cov.data.nullable(),
  status,
  updated_at : stamp
}).and(deposit_state).and(spend_state).and(close_state)

const base_data = z.object({
  status,
  agent_tkn    : hex,
  covenant     : cov.data.nullable(),
  created_at   : stamp,
  dpid         : hash,
  deposit_pk   : hash,
  deposit_addr : str,
  feerate      : num,
  locktime     : num,
  network,
  return_addr  : str,
  return_fee   : num,
  return_psig  : hex,
  sequence     : num,
  spend_xpub   : str,
  updated_at   : stamp,
  utxo         : txspend
})

const data  = base_data.and(deposit_state).and(spend_state).and(close_state)
const shape = base_data.merge(deposit_data).merge(spend_data).merge(settle_data)

export default {
  commit_req,
  close_req,
  data,
  digest,
  deposit_data,
  deposit_state,
  locktime,
  lock_req,
  register_req,
  shape,
  status
}
