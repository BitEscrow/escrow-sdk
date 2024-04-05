import { z } from 'zod'
import base  from './base.js'
import prop  from './proposal.js'
import wit   from './witness.js'

const { hash, literal, num, regex, stamp, signature, str } = base

const config = z.object({
  active_at : stamp,
  closes_at : stamp,
  pathnames : str.array(),
  programs  : prop.programs,
  schedule  : prop.schedule,
  vmid      : hash
})

const program = z.object({
  prog_id : hash,
  method  : str,
  actions : regex,
  params  : literal.array(),
  paths   : regex
})

const data = z.object({
  active_at  : stamp,
  closes_at  : stamp,
  error      : str.nullable(),
  head       : hash,
  output     : str.nullable(),
  state      : str.optional(),
  step       : num,
  updated_at : stamp,
  vmid       : hash
})

const vm_check = z
  .function()
  .args(str, literal.array())
  .returns(str.nullable())

const vm_eval = z
  .function()
  .args(data, z.union([ wit.data, wit.data.array() ]))
  .returns(data)

const vm_init = z
  .function()
  .args(config)
  .returns(data)

const vm_run = z
  .function()
  .args(data, stamp.optional())
  .returns(data)

const api = z.object({
  actions : str.array(),
  methods : str.array(),
  tag     : str,
  check   : vm_check,
  eval    : vm_eval,
  init    : vm_init,
  run     : vm_run
})

const receipt = data.extend({
  created_at : stamp,
  receipt_id : hash,
  server_pk  : hash,
  server_sig : signature
})

export default { api, config, data, program, receipt }
