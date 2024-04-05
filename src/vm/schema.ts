import { z } from 'zod'
import base  from '@/core/schema/base.js'
import prop  from '@/core/schema/proposal.js'
import vm    from '@/core/schema/vm.js'

const { hash, label, num, regex, stamp, str } = base

const path    = z.tuple([ str, num ])
const store   = z.tuple([ hash, str ]).array()
const status  = z.enum([ 'init', 'open', 'disputed', 'closed' ])

const data = z.object({
  active_at  : stamp,
  closes_at  : stamp,
  error      : str.nullable(),
  head       : hash,
  output     : label.nullable(),
  state      : str.optional(),
  step       : num,
  updated_at : stamp,
  vmid       : hash
})

const int_state = z.object({
  paths    : path.array(),
  programs : vm.program.array(),
  store,
  status,
  tasks    : prop.schedule
})

const vm_state = int_state.merge(data).omit({ state: true })

export default {
  data,
  path,
  regex,
  store,
  int_state,
  vm_state,
  status
}
