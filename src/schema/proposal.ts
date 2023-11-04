import { z } from 'zod'
import base  from './base.js'
import wit   from './vm.js'

const { num, payment, literal, network, paypath, stamp, str } = base
const { method, regex, task } = wit

const program  = z.tuple([ regex, regex, method ]).rest(literal)

const data = z.object({
  confirmations : num.optional(),
  details       : str,
  deadline      : num.optional(),
  duration      : num.optional(),
  effective     : stamp.optional(),
  expires       : num,
  fallback      : str.optional(),
  feerate       : num.optional(),
  network       : network.default('main'),
  paths         : paypath.array().default([]),
  payments      : payment.array(),
  programs      : program.array().default([]),
  schedule      : task.array().default([]),
  title         : str,
  value         : num,
  version       : num,
})

export default { data, program, regex, task }
