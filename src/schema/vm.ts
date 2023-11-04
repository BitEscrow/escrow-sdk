import { z } from 'zod'
import base  from './base.js'

const { hash, label, literal, num, stamp, str } = base

const action    = z.enum([ 'lock', 'release', 'dispute', 'resolve', 'close' ])
const commit    = z.tuple([ num, num, hash, hash ])
const entry     = z.tuple([ hash ]).rest(literal)
const method    = z.enum([ 'sign' ])
const path      = z.tuple([ str, num ])
const regex     = z.string().regex(/[a-zA-Z0-9\_\|\*\-]/)
const program   = z.tuple([ hash, regex, regex, label, str.array() ])
const store     = z.tuple([ label, z.any() ])
const task      = z.tuple([ num, action, regex ])
const status    = z.enum([ 'init', 'open', 'disputed', 'closed' ])

const data = z.object({
  commits  : commit.array(),
  error    : label.nullable(),
  head     : hash,
  paths    : path.array(),
  programs : program.array(),
  result   : label.nullable(),
  start    : stamp,
  steps    : num.max(255),
  store    : store.array(),
  status   : status,
  tasks    : task.array(),
  updated  : stamp
})

const witness = z.object({
  action,
  method,
  args    : str.array(),
  path    : label,
  prog_id : hash
})

export default { 
  action,
  commit,
  data,
  entry,
  method,
  path, 
  program,
  regex,
  store,
  task,
  status,
  witness
}
