import { z } from 'zod'
import base  from './base.js'
import prop  from './proposal.js'

const { hash, literal, stamp, str } = base

const config = z.object({
  activated : stamp,
  pathnames : str.array(),
  programs  : prop.programs,
  schedule  : prop.schedule,
  vmid      : hash
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

export default { api, config, check }
