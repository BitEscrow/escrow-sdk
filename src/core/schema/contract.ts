import { z }    from 'zod'
import base     from './base.js'
import proposal from './proposal.js'
import tx       from './tx.js'

const { bool, hash, hex, label, num, payment, stamp } = base

const status  = z.enum([ 'published', 'funded', 'secured', 'pending', 'active', 'closed', 'spent', 'settled', 'expired', 'canceled', 'error' ])
const output  = z.tuple([ label, hex ])

const publish_req = z.object({
  proposal   : proposal.data,
  signatures : hex.array().optional()
})

const vm_info = z.object({
  activated  : bool,
  active_at  : stamp.nullable(),
  active_vm  : hash.nullable(),
  expires_at : stamp.nullable()
})

const vm_active = z.object({
  activated  : z.literal(true),
  active_at  : stamp,
  active_vm  : hash,
  expires_at : stamp
})

const vm_inactive = z.object({
  activated  : z.literal(false),
  active_at  : z.null(),
  active_vm  : z.null(),
  expires_at : z.null()
})

const vm_state = z.discriminatedUnion('activated', [ vm_active, vm_inactive ])

const base_data = z.object({
  cid        : hash,
  created_at : stamp,
  deadline   : stamp,
  feerate    : num,
  fees       : payment.array(),
  fund_count : num,
  fund_pend  : num,
  fund_txfee : num,
  fund_value : num,
  outputs    : output.array(),
  moderator  : hash.nullable(),
  prop_id    : hash,
  pubkeys    : hash.array(),
  server_pk  : hash,
  server_sig : hex,
  signatures : hex.array(),
  status,
  subtotal   : num,
  terms      : proposal.data,
  total      : num,
  tx_fees    : num,
  tx_total   : num,
  tx_bsize   : num,
  tx_vsize   : num,
  updated_at : stamp
})

const data  = base_data.and(vm_state).and(tx.spend_state).and(tx.settle_state)
const shape = base_data.merge(vm_info).merge(tx.spend_info).merge(tx.settle_info)

export default { data, output, publish_req, shape, status }
