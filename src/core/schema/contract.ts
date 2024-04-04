import { z }    from 'zod'
import base     from './base.js'
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
  active_at  : stamp.nullable(),
  cid        : hash,
  created_at : stamp,
  deadline   : stamp,
  expires_at : stamp.nullable(),
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

const data  = base_data.and(spend_state).and(close_state)
const shape = base_data.merge(settle_data).merge(spend_data)

export default { data, digest, output, req, shape, status }
