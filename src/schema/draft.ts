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

const path = z.tuple([ label, num ])

const role = z.object({
  title     : label,
  min_slots : num.optional(),
  max_slots : num.optional(),
  paths     : path.array().optional(),
  payment   : num.optional(),
  programs  : prop.terms.array().optional()
})

const policy = z.object({
  id        : hash,
  title     : label,
  min_slots : num,
  max_slots : num,
  paths     : path.array(),
  payment   : num.optional(),
  programs  : prop.terms.array()
})

const store = z.object({
  cid : str.optional()
})

const terms = prop.data.keyof()

const session = z.object({
  approvals  : hex.array(),
  members    : membership.array(),
  proposal   : prop.data,
  roles      : policy.array(),
  signatures : hex.array(),
  store      : store,
  terms      : terms.array()
})

const template = z.object({
  members    : membership.array().optional(),
  proposal   : prop.template,
  roles      : role.array().optional(),
  signatures : hex.array().optional(),
  store      : store.optional(),
  terms      : terms.array().optional()
})

export default { members, membership, path, policy, role, session, terms, template }
