import { z } from 'zod'
import base  from './base.js'
import prop  from './proposal.js'

const { hash, literal, num, regex, stamp, signature, str } = base

const config = z.object({
  activated : stamp,
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

const check = z
  .function()
  .args(str, literal.array())
  .returns(str.nullable())

const api = z.object({
  check,
  VALID_ACTIONS : str.array(),
  VALID_METHODS : str.array()
})

const data = z.object({
  activated : stamp,
  error     : str.nullable(),
  head      : hash,
  output    : str.nullable(),
  step      : num,
  updated   : stamp,
  vmid      : hash
})

const receipt = data.extend({
  created_at : stamp,
  receipt_id : hash,
  server_pk  : hash,
  server_sig : signature
})

export default { api, config, check, data, program, receipt }
