import { z } from 'zod'
import base  from '@/core/schema/base.js'
import prop  from '@/core/schema/proposal.js'
import vm    from '@/core/schema/vm.js'

const { hash, label, literal, num, regex, stamp, str } = base

const commit  = z.tuple([ num, stamp, hash, hash, label, label ])
const entry   = z.tuple([ hash ]).rest(literal)
const method  = z.enum([ 'endorse' ])
const path    = z.tuple([ str, num ])
const store   = z.tuple([ hash, str ]).array()
const status  = z.enum([ 'init', 'open', 'disputed', 'closed' ])

const data = z.object({
  activated : stamp,
  error     : str.nullable(),
  head      : hash,
  output    : label.nullable(),
  step      : num.max(255),
  updated   : stamp,
  vmid      : hash
})

const state = data.extend({
  commits  : commit.array(),
  paths    : path.array(),
  programs : vm.program.array(),
  store,
  status,
  tasks    : prop.schedule
})

export default {
  commit,
  data,
  entry,
  method,
  path,
  regex,
  store,
  state,
  status
}
