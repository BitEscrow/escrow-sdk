import { z } from 'zod'
import base  from './base.js'

const { 
  hash, label, literal, nonce, num, payment, 
  network, paypath, regex, stamp, str 
} = base

const membership = z.object({
   id  : hash,
  pub  : hash,
  sig  : nonce,
  xpub : str
})

const task     = z.tuple([ num, str, regex ])
const terms    = z.tuple([ str, regex, regex ]).rest(literal)
const members  = membership.array()
const paths    = paypath.array()
const payments = payment.array()
const programs = terms.array()
const schedule = task.array()

const policy = z.object({
  limit    : num,
  paths    : z.tuple([ label, num ]).array(),
  payment  : num.optional(),
  programs : terms.array()
})

const data  = z.object({
  content    : str,
  deadline   : num.optional(),
  duration   : num.optional(),
  effective  : stamp.optional(),
  expires    : num,
  fallback   : str.optional(),
  feerate    : num.optional(),
  members    : members,
  moderator  : hash.optional(),
  network    : network,
  paths      : paths,
  payments   : payments,
  programs   : programs,
  schedule   : schedule,
  title      : str,
  value      : num,
  version    : num
})

export default {
  data,
  members,
  paths,
  payments,
  policy,
  programs,
  schedule,
  task,
  terms
}
