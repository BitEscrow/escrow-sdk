import { z }    from 'zod'
import base     from '@/schema.js'
import proposal from './proposal.js'
import tx       from './tx.js'

const { hash, hex, label, num, payment, stamp } = base
const { close_state, settle_data, spend_data, spend_state } = tx

const status  = z.enum([ 'published', 'funded', 'secured', 'pending', 'active', 'closed', 'spent', 'settled', 'expired', 'canceled', 'error' ])
const output  = z.tuple([ label, hex ])

const req = z.object({
  proposal   : proposal.data,
  signatures : hex.array().optional()
})

const digest = z.object({
  activated  : stamp.nullable(),
  balance    : num,
  est_txfee  : num,
  est_txsize : num,
  pending    : num,
  status,
  total      : num,
  txin_count : num,
  updated_at : stamp
}).and(spend_state).and(close_state)

const base_data = z.object({
  activated  : stamp.nullable(),
  balance    : num,
  cid        : hash,
  deadline   : stamp,
  est_txfee  : num,
  est_txsize : num,
  expires_at : stamp.nullable(),
  feerate    : num,
  fees       : payment.array(),
  outputs    : output.array(),
  moderator  : hash.nullable(),
  pending    : num,
  prop_id    : hash,
  pubkeys    : hash.array(),
  published  : stamp,
  sig        : hex,
  signatures : hex.array(),
  status,
  subtotal   : num,
  terms      : proposal.data,
  total      : num,
  txin_count : num,
  updated_at : stamp,
  vmid       : hash.nullable(),
  vout_size  : num
})

const data  = base_data.and(spend_state).and(close_state)
const shape = base_data.merge(settle_data).merge(spend_data)

export default { data, digest, output, req, shape, status }
