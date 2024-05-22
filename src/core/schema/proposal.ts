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
  content    : str.optional(),
  created_at : stamp,
  deadline   : num,
  duration   : num,
  engine     : str,
  effective  : stamp.optional(),
  feerate    : num.optional(),
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

const policy = z.object({
  FEERATE_MIN   : num,
  FEERATE_MAX   : num,
  DEADLINE_MIN  : num,
  DEADLINE_MAX  : num,
  DURATION_MIN  : num,
  DURATION_MAX  : num,
  EFFECTIVE_MAX : num,
  MULTISIG_MAX  : num,
  TXTIMEOUT_MIN : num,
  TXTIMEOUT_MAX : num,
  VALID_ENGINES : str.array()
})

export default {
  data,
  paypath,
  paths,
  payment,
  payments,
  policy,
  program,
  programs,
  schedule,
  task,
  template
}
