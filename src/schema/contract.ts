import { z }    from 'zod'
import base     from './base.js'
import draft    from './draft.js'
import proposal from './proposal.js'
import tx       from './tx.js'
import vm       from './vm.js'

const { hash, hex, label, nonce, num, payment, stamp }       = base
const { close_state, settle_data, spend_data, spend_state }  = tx

const agent = z.object({
  agent_id : hash,
  agent_pk : hash,
  agent_pn : nonce
})

const status  = z.enum([ 'published', 'funded', 'secured', 'pending', 'active', 'closed', 'spent', 'settled', 'expired', 'canceled', 'error' ])
const output  = z.tuple([ label, hex ])

const digest = z.object({
  activated   : stamp.nullable(),
  balance     : num,
  est_txfee   : num,
  est_txsize  : num,
  pending     : num,
  status,
  total       : num,
  txin_count  : num,
  updated_at  : stamp,
  vm_state    : vm.data.nullable()
}).and(spend_state).and(close_state)

const base_data = z.object({
  activated   : stamp.nullable(),
  agent_fee   : payment,
  balance     : num,
  cid         : hash,
  deadline    : stamp,
  est_txfee   : num,
  est_txsize  : num,
  expires_at  : stamp.nullable(),
  feerate     : num,
  outputs     : output.array(),
  members     : draft.members,
  moderator   : hash.nullable(),
  pending     : num,
  prop_id     : hash,
  pubkeys     : hash.array(),
  published   : stamp,
  signatures  : hex.array(),
  status,
  subtotal    : num,
  terms       : proposal.data,
  total       : num,
  txin_count  : num,
  updated_at  : stamp,
  vm_state    : vm.data.nullable(),
  vout_size   : num
}).merge(agent)

const data  = base_data.and(spend_state).and(close_state)
const shape = base_data.merge(settle_data).merge(spend_data)

export default { agent, data, digest, output, shape, status }
