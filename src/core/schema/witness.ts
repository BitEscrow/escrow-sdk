import { z } from 'zod'
import base  from './base.js'

const { hash, hex, label, literal, stamp, str } = base

const data = z.object({
  args    : literal.array(),
  action  : str,
  method  : str,
  path    : label,
  prog_id : hash,
  sigs    : hex.array(),
  stamp,
  vmid    : hash,
  wid     : hash
})

export default { data }
