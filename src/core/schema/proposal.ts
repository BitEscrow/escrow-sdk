import { z } from 'zod'
import base  from '@/schema.js'
import prog  from './vm.js'

const { hash, num, payment, network, paypath, stamp, str } = base

const paths    = paypath.array()
const payments = payment.array()
const programs = prog.terms.array()
const schedule = prog.task.array()

const data  = z.object({
  content    : str,
  created_at : stamp,
  deadline   : num.optional(),
  duration   : num,
  effective  : stamp.optional(),
  fallback   : str.optional(),
  feerate    : num.optional(),
  moderator  : hash.optional(),
  network,
  paths,
  payments,
  programs,
  schedule,
  title      : str,
  value      : num,
  version    : num
})

const template = data.partial().extend({
  duration : num,
  network,
  title    : str,
  value    : num
})

export default {
  data,
  paths,
  payments,
  programs,
  schedule,
  template
}
