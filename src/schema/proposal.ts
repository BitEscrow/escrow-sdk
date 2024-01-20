import { z } from 'zod'
import base  from './base.js'

const { 
  hash, literal, nonce, num, payment, 
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

const data  = z.object({
  content    : str,
  deadline   : num.optional(),
  duration   : num.optional(),
  effective  : stamp.optional(),
  expires    : num,
  fallback   : str.optional(),
  feerate    : num.optional(),
  members    : members.default([]),
  moderator  : hash.optional(),
  network    : network.default('main'),
  paths      : paths.default([]),
  payments   : payments.default([]),
  programs   : programs.default([]),
  schedule   : schedule.default([]),
  title      : str,
  value      : num,
  version    : num
})

export default { data, members, paths, payments, programs, schedule, task, terms }
