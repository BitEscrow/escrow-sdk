import { z }    from 'zod'
import base     from './base.js'
import proposal from './proposal.js'
import tx       from './tx.js'
import vm       from './vm.js'

const { hash, hex, label, literal, nonce, num, payment, regex, stamp } = base
const { data : terms } = proposal
const { close_state, spend_state } = tx

const agent = z.object({
  agent_id : hash,
  agent_pk : hash,
  agent_pn : nonce
})

const status  = z.enum([ 'published', 'funded', 'secured', 'pending', 'active', 'closed', 'spent', 'settled', 'expired', 'canceled', 'error' ])
const output  = z.tuple([ label, hex ])
const program = z.tuple([ hash, label, regex, regex ]).rest(literal)

const request = z.object({
  proposal   : terms,
  signatures : hex.array().default([])
})

const data = z.object({
  activated   : stamp.nullable(),
  balance     : num,
  cid         : hash,
  deadline    : stamp,
  expires_at  : stamp.nullable(),
  fees        : payment.array(),
  outputs     : output.array(),
  moderator   : hash.nullable(),
  pending     : num,
  programs    : program.array(),
  prop_id     : hash,
  pubkeys     : hash.array(),
  published   : stamp,
  signatures  : hex.array(),
  status,
  terms,
  total       : num,
  updated_at  : stamp,
  vm_state    : vm.data.nullable(),
}).and(agent).and(spend_state).and(close_state)

export default { agent, data, output, request, status }
