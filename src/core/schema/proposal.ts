import { z } from 'zod'
import base  from './base.js'

const { address, hash, label, literal, num, network, regex, stamp, str } = base

const payment   = z.tuple([ num, address ])
const paypath   = z.tuple([ label, num, address ])
const program = z.tuple([ str, regex, regex ]).rest(literal)
const task    = z.tuple([ num, str, regex ])

const paths    = paypath.array()
const payments = payment.array()
const programs = program.array()
const schedule = task.array()

const data  = z.object({
  content    : str,
  created_at : stamp,
  deadline   : num,
  duration   : num,
  engine     : str,
  effective  : stamp.optional(),
  feerate    : num.optional(),
  fee_target : num.optional(),
  moderator  : hash.optional(),
  network,
  paths,
  payments,
  programs,
  schedule,
  title      : str,
  txtimeout  : num,
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
  paypath,
  paths,
  payment,
  payments,
  program,
  programs,
  schedule,
  task,
  template
}
