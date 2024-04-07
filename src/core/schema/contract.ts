import { z }    from 'zod'
import base     from './base.js'
import proposal from './proposal.js'
import tx       from './tx.js'

const { bool, hash, hex, label, num, payment, stamp, str } = base

const status  = z.enum([ 'published', 'funded', 'secured', 'active', 'closed', 'spent', 'settled', 'expired', 'canceled', 'error' ])
const output  = z.tuple([ label, hex ])

const publish_req = z.object({
  proposal   : proposal.data,
  signatures : hex.array().optional()
})

const close_info = tx.spend_info.extend({
  closed      : bool,
  closed_at   : stamp.nullable(),
  closed_hash : hash.nullable(),
  closed_path : str.nullable()
})

const ct_open = z.object({
  closed      : z.literal(false),
  closed_at   : z.null(),
  closed_hash : z.null(),
  closed_path : z.null()
})

const ct_closed = z.object({
  closed      : z.literal(true),
  closed_at   : stamp,
  closed_hash : hash,
  closed_path : str
})

const close_state = z.discriminatedUnion('closed', [ ct_open, ct_closed ])

const vm_info = z.object({
  activated  : bool,
  active_at  : stamp.nullable(),
  expires_at : stamp.nullable(),
  vmid       : hash.nullable()
})

const vm_active = z.object({
  activated  : z.literal(true),
  active_at  : stamp,
  expires_at : stamp,
  vmid       : hash
})

const vm_inactive = z.object({
  activated  : z.literal(false),
  active_at  : z.null(),
  expires_at : z.null(),
  vmid       : z.null()
})

const vm_state = z.discriminatedUnion('activated', [ vm_active, vm_inactive ])

const base_data = z.object({
  cid          : hash,
  created_at   : stamp,
  deadline     : stamp,
  effective_at : stamp.nullable(),
  feerate      : num,
  fees         : payment.array(),
  fund_count   : num,
  fund_pend    : num,
  fund_txfee   : num,
  fund_value   : num,
  outputs      : output.array(),
  moderator    : hash.nullable(),
  prop_id      : hash,
  server_pk    : hash,
  server_sig   : hex,
  signatures   : hex.array(),
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
  .and(close_state)
  .and(vm_state)
  .and(tx.spend_state)
  .and(tx.settle_state)

const shape = base_data
  .merge(close_info)
  .merge(vm_info)
  .merge(tx.spend_info)
  .merge(tx.settle_info)

export default { data, output, publish_req, shape, status }
