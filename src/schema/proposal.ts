import { z } from 'zod'
import base  from './base.js'
import vm    from './vm.js'

const { 
  hash, hex, literal, nonce, num, payment, 
  network, paypath, regex, stamp, str 
} = base

const { task } = vm

const membership = z.object({
   id  : hash,
  pub  : hash,
  sig  : nonce,
  xpub : str
})

const terms = z.tuple([ str, regex, regex ]).rest(literal)

const data  = z.object({
  content    : str,
  deadline   : num.optional(),
  duration   : num.optional(),
  effective  : stamp.optional(),
  expires    : num,
  fallback   : str.optional(),
  feerate    : num.optional(),
  members    : membership.array().default([]),
  moderator  : hash.optional(),
  network    : network.default('main'),
  paths      : paypath.array().default([]),
  payments   : payment.array().default([]),
  programs   : terms.array().default([]),
  schedule   : task.array().default([]),
  signatures : hex.array().default([]),
  title      : str,
  value      : num,
  version    : num
})

export default { data, terms }
