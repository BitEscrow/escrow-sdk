import { z } from 'zod'
import base  from './base.js'

const { hash, hex, label, literal, num, signature, stamp, str } = base

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

const receipt = data.extend({
  receipt_at : stamp,
  receipt_id : hash,
  server_pk  : hash,
  server_sig : signature,
  vm_hash    : hash,
  vm_output  : str.nullable(),
  vm_step    : num
})

export default { data, receipt }
