import { z } from 'zod'
import base  from './base.js'
import vm    from './vm.js'

const { hash, hex, label, num, str } = base
const { action, regex } = vm

const lock_params = z.tuple([ num ]).rest(hash)

const lock_terms = z.object({
  method  : z.literal('reveal'),
  actions : action,
  paths   : label,
  params  : lock_params
})

const lock_witness = z.object({
  prog_id : hash,
  method  : z.literal('reveal'),
  action,
  path    : label,
  args    : hex.array()
})

const sign_params = z.tuple([ num ]).rest(hash)

const sign_terms = z.object({
  method  : z.literal('sign'),
  actions : regex,
  paths   : regex,
  params  : sign_params
})

const sign_witness = z.object({
  prog_id : hash,
  method  : z.literal('sign'),
  action,
  path    : label,
  args    : str.array()
})

const terms   = z.discriminatedUnion('method', [ lock_terms, sign_terms ])
const witness = z.discriminatedUnion('method', [ lock_witness, sign_witness ])

export default { terms, witness }
