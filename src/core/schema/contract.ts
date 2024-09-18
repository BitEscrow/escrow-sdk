import { z }    from 'zod'
import base     from '@/schema/base.js'
import deposit  from './deposit.js'
import proposal from './proposal.js'
import vm       from './machine.js'
import tx       from './tx.js'
import witness  from './witness.js'

const { bool, hash, hex, label, num, stamp, str } = base

const status  = z.enum([ 'published', 'canceled', 'secured', 'active', 'closed', 'spent', 'settled', 'error' ])
const output  = z.tuple([ label, hex ])

/* ------------------- [ Request Schema ] ------------------- */

const publish_req = z.object({
  endorsements : hex.array().optional(),
  proposal     : proposal.data
})

/* ------------------- [ State Schema ] ------------------- */

const publish_info = z.object({
  canceled     : bool,
  canceled_at  : stamp.nullable(),
  canceled_sig : hex.nullable()
})

const ct_published = z.object({
  canceled     : z.literal(false),
  canceled_at  : z.null(),
  canceled_sig : z.null()
})

const ct_canceled = z.object({
  canceled     : z.literal(true),
  canceled_at  : stamp,
  canceled_sig : hex
})

const funding_info = z.object({
  secured      : bool,
  secured_sig  : hex.nullable(),
  effective_at : stamp.nullable()
})

const ct_pending = z.object({
  secured      : z.literal(false),
  secured_sig  : z.null(),
  effective_at : z.null()
})

const ct_secured = z.object({
  secured      : z.literal(true),
  secured_sig  : hex,
  effective_at : stamp
})

const engine_info = z.object({
  activated    : bool,
  active_at    : stamp.nullable(),
  active_sig   : hex.nullable(),
  machine_head : hash.nullable(),
  machine_vmid : hash.nullable(),
  expires_at   : stamp.nullable()
})

const ct_active = z.object({
  activated    : z.literal(true),
  active_at    : stamp,
  active_sig   : hex,
  machine_head : hash,
  machine_vmid : hash,
  expires_at   : stamp
})

const ct_inactive = z.object({
  activated    : z.literal(false),
  active_at    : z.null(),
  active_sig   : z.null(),
  machine_head : z.null(),
  machine_vmid : z.null(),
  expires_at   : z.null()
})

const close_info = z.object({
  closed       : bool,
  closed_at    : stamp.nullable(),
  closed_sig   : hex.nullable(),
  machine_vout : str.nullable()
})

const ct_open = z.object({
  closed       : z.literal(false),
  closed_at    : z.null(),
  closed_sig   : z.null(),
  machine_vout : z.null()
})

const ct_closed = z.object({
  closed       : z.literal(true),
  closed_at    : stamp,
  closed_sig   : hex,
  machine_vout : str.nullable()
})

const settle_info = z.object({
  settled      : z.boolean(),
  settled_at   : stamp.nullable(),
  settled_sig  : hex.nullable(),
  spent_block  : hash.nullable(),
  spent_height : num.nullable()
})

const ct_settled = z.object({
  settled      : z.literal(true),
  settled_at   : stamp,
  settled_sig  : hex,
  spent_block  : hash.nullable(),
  spent_height : num.nullable()
})

const ct_unsettled = z.object({
  settled      : z.literal(false),
  settled_at   : z.null(),
  settled_sig  : z.null(),
  spent_block  : z.null(),
  spent_height : z.null()
})

/* ------------------- [ State Unions ] ------------------- */

const publish_state = z.discriminatedUnion('canceled',  [ ct_published, ct_canceled ])
const funding_state = z.discriminatedUnion('secured',   [ ct_secured,   ct_pending  ])
const engine_state  = z.discriminatedUnion('activated', [ ct_active,    ct_inactive ])
const close_state   = z.discriminatedUnion('closed',    [ ct_open,      ct_closed   ])
const settle_state  = z.discriminatedUnion('settled',   [ ct_settled,   ct_unsettled ])

/* ------------------- [ Contract Schema ] ------------------- */

const base_data = z.object({
  agent_pk     : hash,
  cid          : hash,
  created_at   : stamp,
  created_sig  : hex,
  deadline_at  : stamp,
  endorsements : hex.array(),
  feerate      : num,
  fees         : proposal.payments,
  funds_pend   : num,
  funds_conf   : num,
  outputs      : output.array(),
  moderator    : hash.nullable(),
  prop_id      : hash,
  status,
  subtotal     : num,
  terms        : proposal.data,
  tx_bsize     : num,
  tx_fees      : num,
  tx_total     : num,
  tx_vsize     : num,
  updated_at   : stamp,
  vin_count    : num,
  vin_txfee    : num
})

const data = base_data
  .and(publish_state)
  .and(funding_state)
  .and(engine_state)
  .and(close_state)
  .and(tx.spend_state)
  .and(settle_state)

const shape = base_data
  .merge(publish_info)
  .merge(funding_info)
  .merge(engine_info)
  .merge(close_info)
  .merge(tx.spend_info)
  .merge(settle_info)

const session = z.object({
  contract   : data,
  engine     : vm.api.optional(),
  funds      : deposit.fund.array().optional(),
  statements : witness.data.array().optional(),
  vmdata     : vm.data.optional()
})

export default { data, output, publish_req, session, shape, status }
