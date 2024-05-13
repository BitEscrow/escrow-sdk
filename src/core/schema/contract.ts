import { z }    from 'zod'
import base     from './base.js'
import proposal from './proposal.js'
import tx       from './tx.js'

const { bool, hash, hex, label, num, stamp, str } = base

const status  = z.enum([ 'published', 'funded', 'secured', 'active', 'closed', 'spent', 'settled', 'expired', 'canceled', 'error' ])
const output  = z.tuple([ label, hex ])

/* ------------------- [ Request Schema ] ------------------- */

const publish_req = z.object({
  endorsements : hex.array().optional(),
  proposal     : proposal.data
})

/* ------------------- [ State Schema ] ------------------- */

const publish_info = z.object({
  canceled    : bool,
  canceled_at : stamp.nullable()
})

const ct_published = z.object({
  canceled    : z.literal(false),
  canceled_at : z.null()
})

const ct_canceled = z.object({
  canceled    : z.literal(true),
  canceled_at : stamp
})

const funding_info = z.object({
  secured      : bool,
  effective_at : stamp.nullable(),
  tx_fees      : num.nullable(),
  tx_total     : num.nullable(),
  tx_vsize     : num.nullable()
})

const ct_pending = z.object({
  secured      : z.literal(false),
  effective_at : z.null(),
  tx_fees      : z.null(),
  tx_total     : z.null(),
  tx_vsize     : z.null()
})

const ct_secured = z.object({
  secured      : z.literal(true),
  effective_at : stamp,
  tx_fees      : num,
  tx_total     : num,
  tx_vsize     : num
})

const close_info = z.object({
  closed      : bool,
  closed_at   : stamp.nullable(),
  engine_head : hash.nullable(),
  engine_vout : str.nullable()
})

const ct_open = z.object({
  closed      : z.literal(false),
  closed_at   : z.null(),
  engine_head : z.null(),
  engine_vout : z.null()
})

const ct_closed = z.object({
  closed      : z.literal(true),
  closed_at   : stamp,
  engine_head : hash,
  engine_vout : str.nullable()
})

const engine_info = z.object({
  activated   : bool,
  active_at   : stamp.nullable(),
  engine_vmid : hash.nullable(),
  expires_at  : stamp.nullable()
})

const vm_active = z.object({
  activated   : z.literal(true),
  active_at   : stamp,
  engine_vmid : hash,
  expires_at  : stamp
})

const vm_inactive = z.object({
  activated   : z.literal(false),
  active_at   : z.null(),
  engine_vmid : z.null(),
  expires_at  : z.null()
})

/* ------------------- [ State Unions ] ------------------- */

const publish_state = z.discriminatedUnion('canceled',  [ ct_published, ct_canceled ])
const funding_state = z.discriminatedUnion('secured',   [ ct_secured,   ct_pending  ])
const engine_state  = z.discriminatedUnion('activated', [ vm_active,    vm_inactive ])
const close_state   = z.discriminatedUnion('closed',    [ ct_open,      ct_closed   ])

/* ------------------- [ Contract Schema ] ------------------- */

const base_data = z.object({
  cid          : hash,
  created_at   : stamp,
  deadline_at  : stamp,
  endorsements : hex.array(),
  feerate      : num,
  fees         : proposal.payments,
  fund_count   : num,
  fund_pend    : num,
  fund_txfee   : num,
  fund_value   : num,
  outputs      : output.array(),
  moderator    : hash.nullable(),
  prop_id      : hash,
  server_pk    : hash,
  sigs         : z.tuple([ status, hex ]).array(),
  status,
  subtotal     : num,
  terms        : proposal.data,
  tx_bsize     : num,
  updated_at   : stamp
})

const data  = base_data
  .and(publish_state)
  .and(funding_state)
  .and(engine_state)
  .and(close_state)
  .and(tx.spend_state)
  .and(tx.settle_state)

const shape = base_data
  .merge(publish_info)
  .merge(funding_info)
  .merge(engine_info)
  .merge(close_info)
  .merge(tx.spend_info)
  .merge(tx.settle_info)

export default { data, output, publish_req, shape, status }
