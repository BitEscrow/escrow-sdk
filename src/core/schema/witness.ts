import { z } from 'zod'
import base  from '@/schema.js'
import prop  from './proposal.js'

const { hash, hex, label, literal, stamp, str } = base

const vmconfig = z.object({
  activated : stamp,
  pathnames : str.array(),
  programs  : prop.programs,
  schedule  : prop.schedule,
  vmid      : hash
})

const data = z.object({
  args    : literal.array(),
  action  : str,
  method  : str,
  path    : label,
  prog_id : hash,
  sigs    : hex.array(),
  stamp,
  wid     : hash
})

export default { data, vmconfig }
