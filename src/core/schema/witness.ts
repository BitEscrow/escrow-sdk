import { z } from 'zod'
import base  from './base.js'

const { bool, hash, hex, label, literal, num, signature, stamp, str } = base

const data = z.object({
  args    : literal.array(),
  action  : str,
  content : str,
  method  : str,
  path    : label,
  prog_id : hash,
  sigs    : hex.array(),
  stamp,
  vmid    : hash,
  wid     : hash
})

const receipt = data.extend({
  agent_pk   : hash,
  commit_at  : stamp,
  commit_id  : hash,
  commit_sig : signature,
  vm_closed  : bool,
  vm_head    : hash,
  vm_output  : str.nullable(),
  vm_step    : num
})

export default { data, receipt }
