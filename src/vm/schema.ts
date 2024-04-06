import { z } from 'zod'
import base  from '@/core/schema/base.js'
import vm    from '@/core/schema/vm.js'

const { hash, num, regex, str } = base

const data    = vm.data
const path    = z.tuple([ str, num ])
const store   = z.tuple([ hash, str ]).array()
const status  = z.enum([ 'init', 'open', 'disputed', 'closed' ])

const int_state = z.object({
  paths : path.array(),
  store,
  status
})

const vm_state = data.extend({
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
