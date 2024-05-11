import { z }    from 'zod'
import base     from './base.js'
import proposal from './proposal.js'
import tx       from './tx.js'

const { bool, hash, hex, label, num, stamp, str } = base

const status  = z.enum([ 'published', 'funded', 'secured', 'active', 'closed', 'spent', 'settled', 'expired', 'canceled', 'error' ])
const output  = z.tuple([ label, hex ])

const publish_req = z.object({
  endorsements : hex.array().optional(),
  proposal     : proposal.data
})

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

const close_info = z.object({
  closed      : bool,
  closed_at   : stamp.nullable(),
  closed_path : str.nullable()
})

const ct_open = z.object({
  closed      : z.literal(false),
  closed_at   : z.null(),
  closed_path : z.null()
})

const ct_closed = z.object({
  closed      : z.literal(true),
  closed_at   : stamp,
  closed_path : str.nullable()
})

const publish_state = z.discriminatedUnion('canceled', [ ct_published, ct_canceled ])
const close_state   = z.discriminatedUnion('closed', [ ct_open, ct_closed ])

const vm_info = z.object({
  activated   : bool,
  active_at   : stamp.nullable(),
  active_head : hash.nullable(),
  expires_at  : stamp.nullable(),
  vmid        : hash.nullable()
})

const vm_active = z.object({
  activated   : z.literal(true),
  active_at   : stamp,
  active_head : hash,
  expires_at  : stamp,
  vmid        : hash
})

const vm_inactive = z.object({
  activated   : z.literal(false),
  active_at   : z.null(),
  active_head : z.null(),
  expires_at  : z.null(),
  vmid        : z.null()
})

const vm_state = z.discriminatedUnion('activated', [ vm_active, vm_inactive ])

const base_data = z.object({
  cid          : hash,
  created_at   : stamp,
  deadline_at  : stamp,
  effective_at : stamp.nullable(),
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
  server_sig   : hex,
  status,
  subtotal     : num,
  terms        : proposal.data,
  tx_fees      : num,
  tx_total     : num,
  tx_bsize     : num,
  tx_vsize     : num,
  updated_at   : stamp
})

const data  = base_data
  .and(publish_state)
  .and(close_state)
  .and(vm_state)
  .and(tx.spend_state)
  .and(tx.settle_state)

const shape = base_data
  .merge(publish_info)
  .merge(close_info)
  .merge(vm_info)
  .merge(tx.spend_info)
  .merge(tx.settle_info)

export default { data, output, publish_req, shape, status }
