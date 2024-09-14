import { z }   from 'zod'
import base    from '@/schema/base.js'
import machine from '@/core/schema/machine.js'

const { hash, num, regex, str } = base

const data    = machine.data
const path    = z.tuple([ str, num ])
const store   = z.tuple([ hash, str ]).array()
const status  = z.enum([ 'init', 'open', 'disputed', 'closed', 'spent' ])

const int_state = z.object({
  paths : path.array(),
  store,
  status
})

const vm_state = machine.shape.extend({
  state : int_state
})

export default {
  data,
  path,
  regex,
  store,
  int_state,
  vm_state,
  status
}
