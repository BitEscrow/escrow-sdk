import { z } from 'zod'
import base  from './base.js'
import vm    from './vm.js'

const { hash, nonce, num, payment, network, paypath, stamp, str } = base
const { task, terms } = vm

const membership = z.object({
   id  : hash,
  pub  : hash,
  sig  : nonce,
  xpub : str
})

const data = z.object({
  content   : str,
  deadline  : num.optional(),
  duration  : num.optional(),
  effective : stamp.optional(),
  expires   : num,
  fallback  : str.optional(),
  feerate   : num.optional(),
  members   : membership.array().default([]),
  network   : network.default('main'),
  paths     : paypath.array().default([]),
  payments  : payment.array(),
  programs  : terms.array().default([]),
  schedule  : task.array().default([]),
  title     : str,
  value     : num,
  version   : num
})

export default { data }
