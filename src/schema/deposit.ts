import { z } from 'zod'
import base  from './base.js'
import sess  from './session.js'
import tx    from './tx.js'

const { hash, hex, num, stamp             } = base
const { agent, covenant                   } = sess
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

const template = z.object({
  agent_id  : hash,
  covenant  : covenant.optional(),
  return_tx : hex,
})

const data = agent.merge(txspend).extend({
  status,
  covenant    : covenant.nullable(),
  created_at  : stamp,
  deposit_id  : hash,
  deposit_key : hash,
  return_tx   : hex,
  sequence    : num,
  updated_at  : stamp
}).and(state).and(spend_state).and(close_state)

export default { covenant, data, state, status, template }
