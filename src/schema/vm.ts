import { z } from 'zod'
import base  from './base.js'
import prop  from './proposal.js'

const { hash, hex, label, literal, num, regex, stamp, str } = base

const commit    = z.tuple([ num, stamp, hash, hash, label, label ])
const entry     = z.tuple([ hash ]).rest(literal)
const method    = z.enum([ 'oracle', 'reveal', 'endorse' ])
const path      = z.tuple([ str, num ])
const program   = z.tuple([ hash, label, regex, regex ]).rest(literal)
const store     = z.tuple([ hash, str ]).array()
const status    = z.enum([ 'init', 'open', 'disputed', 'closed' ])

const config = z.object({
  activated : stamp,
  cid       : hash,
  pathnames : label.array(),
  programs  : prop.programs,
  schedule  : prop.schedule
})

const data = z.object({
  commits  : commit.array(),
  error    : str.nullable(),
  head     : hash,
  output   : label.nullable(),
  paths    : path.array(),
  programs : program.array(),
  start    : stamp,
  steps    : num.max(255),
  store    : store,
  status   : status,
  tasks    : prop.schedule,
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
  config,
  data,
  entry,
  method,
  path,
  regex,
  store,
  status,
  witness
}
