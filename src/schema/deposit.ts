import { z } from 'zod'
import base  from './base.js'
import tx    from './tx.js'

const { bech32, hash, hex, nonce, num, psig, stamp, str } = base
const { close_state, spend_state, txspend } = tx

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

const state  = z.discriminatedUnion('confirmed', [ confirmed, unconfirmed ])
const status = z.enum([ 'reserved', 'pending', 'stale', 'open', 'locked', 'spent', 'settled', 'expired', 'error' ])

const request = z.object({
  address    : bech32,
  agent_id   : hash,
  agent_pk   : hash,
  created_at : stamp,
  dpid       : hash,
  member_pk  : hash,
  sequence   : num,
  sig        : nonce
})

const covenant = z.object({
  cid    : hash,
  pnonce : nonce,
  psigs  : z.tuple([ str, psig ]).array()
})

const register = z.object({
  agent_id  : hash,
  covenant  : covenant.optional(),
  return_tx : hex,
})

const refund = z.object({
  dpid   : hash,
  pnonce : nonce,
  psig,
  txhex  : hex
})

const data = z.object({
  status,
  agent_id   : hash,
  agent_pk   : hash,
  agent_pn   : nonce,
  covenant   : covenant.nullable(),
  created_at : stamp,
  dpid       : hash,
  member_pk  : hash,
  return_tx  : hex,
  sequence   : num,
  updated_at : stamp
}).and(state).and(spend_state).and(close_state).and(txspend)

export default { covenant, data, state, refund, request, register, status }
