import { z } from 'zod'
import base  from './base.js'
import vm    from './vm.js'

const { hash, hex, label, num } = base
const { action, regex } = vm

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
  args    : hex.array()
})

const terms   = z.discriminatedUnion('method', [ sign_terms ])
const witness = z.discriminatedUnion('method', [ sign_witness ])

export default { terms, witness }