import { z } from 'zod'
import base  from './base.js'
import tx    from './tx.js'
 
const { bech32, bool, hash, hex, nonce, num, psig, stamp, str } = base
const { close_state, settle_data, spend_data, spend_state, txspend } = tx

const locktime = z.union([ str, num ]).transform(e => Number(e))
const status   = z.enum([ 'reserved', 'pending', 'stale', 'open', 'locked', 'spent', 'settled', 'expired', 'error' ])

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

const account = z.object({
  acct_id    : hash,
  acct_sig   : nonce,
  address    : bech32,
  agent_id   : hash,
  agent_pk   : hash,
  created_at : stamp,
  deposit_pk : hash,
  sequence   : num,
  spend_xpub : str
})

const covenant = z.object({
  cid    : hash,
  pnonce : nonce,
  psigs  : z.tuple([ str, psig ]).array()
})

const digest = z.object({
  covenant   : covenant.nullable(),
  status,
  updated_at : stamp,
}).and(deposit_state).and(spend_state).and(close_state)

const base_data = z.object({
  status,
  agent_id    : hash,
  agent_pk    : hash,
  agent_pn    : nonce,
  covenant    : covenant.nullable(),
  created_at  : stamp,
  dpid        : hash,
  deposit_pk  : hash,
  return_psig : hex.nullable(),
  sequence    : num,
  spend_xpub  : str,
  updated_at  : stamp
}).merge(txspend)

const data  = base_data.and(deposit_state).and(spend_state).and(close_state)
const shape = base_data.merge(deposit_data).merge(spend_data).merge(settle_data)

export default {
  account,
  covenant,
  data,
  digest,
  deposit_data,
  deposit_state,
  locktime,
  shape,
  status
}
