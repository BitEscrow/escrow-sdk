import { z } from 'zod'
import base  from './base.js'

const { 
  hash, literal, num, payment, 
  network, paypath, regex, stamp, str 
} = base

const task     = z.tuple([ num, str, regex ])
const terms    = z.tuple([ str, regex, regex ]).rest(literal)

const paths    = paypath.array()
const payments = payment.array()
const programs = terms.array()
const schedule = task.array()

const data  = z.object({
  content    : str,
  deadline   : num.optional(),
  duration   : num,
  effective  : stamp.optional(),
  fallback   : str.optional(),
  feerate    : num.optional(),
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
  paths,
  payments,
  programs,
  schedule,
  task,
  terms
}
