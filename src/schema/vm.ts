import { z } from 'zod'
import base  from './base.js'

const { hash, hex, label, literal, num, regex, stamp, str } = base

const commit    = z.tuple([ num, num, hash, hash ])
const entry     = z.tuple([ hash ]).rest(literal)
const method    = z.enum([ 'oracle', 'reveal', 'sign' ])
const path      = z.tuple([ str, num ])
const program   = z.tuple([ hash, label, regex, regex ]).rest(literal)
const store     = z.tuple([ hash, str ]).array()
const task      = z.tuple([ num, str, regex ])
const status    = z.enum([ 'init', 'open', 'disputed', 'closed' ])

const data = z.object({
  commits  : commit.array(),
  head     : hash,
  paths    : path.array(),
  programs : program.array(),
  result   : label.nullable(),
  start    : stamp,
  steps    : num.max(255),
  store    : store,
  status   : status,
  tasks    : task.array(),
  updated  : stamp
})

const witness = z.object({
  args    : literal.array(),
  action  : str,
  method  : str,
  path    : label,
  prog_id : hash,
  sigs    : hex.array(),
  stamp   : stamp,
  wid     : hash,
})

export default { 
  commit,
  data,
  entry,
  method,
  path,
  regex,
  store,
  task,
  status,
  witness
}
