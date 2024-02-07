import { z } from 'zod'
import base  from './base.js'
import prop  from './proposal.js'

const { hash, hex, label, nonce, num, str } = base

const membership = z.object({
  id   : hash,
  pol  : hash.optional(),
  pub  : hash,
  sig  : nonce,
  xpub : str
})

const members = membership.array()

const policy = z.object({
  id        : hash,
  title     : label,
  min_slots : num,
  max_slots : num,
  paths     : z.tuple([ label, num ]).array(),
  payment   : num.optional(),
  programs  : prop.terms.array()
})

const session = z.object({
  members    : membership.array(),
  proposal   : prop.data,
  roles      : policy.array(),
  signatures : hex.array()
})

export default { members, membership, policy, session }
