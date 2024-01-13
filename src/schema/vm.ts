import { z } from 'zod'
import base  from './base.js'

const { hash, label, literal, nonce, num, regex, stamp, str } = base

const commit    = z.tuple([ num, num, hash, hash ])
const entry     = z.tuple([ hash ]).rest(literal)
const method    = z.enum([ 'oracle', 'reveal', 'sign' ])
const path      = z.tuple([ str, num ])
const manifest  = z.tuple([ hash, label, regex, regex ]).rest(literal)
const item      = z.tuple([ label, str ])
const store     = z.tuple([ label, item.array() ])
const task      = z.tuple([ num, str, regex ])
const terms     = z.tuple([ str, regex, regex ]).rest(literal)
const status    = z.enum([ 'init', 'open', 'disputed', 'closed' ])

const data = z.object({
  commits  : commit.array(),
  head     : hash,
  paths    : path.array(),
  programs : manifest.array(),
  result   : label.nullable(),
  start    : stamp,
  steps    : num.max(255),
  store    : store.array(),
  status   : status,
  tasks    : task.array(),
  updated  : stamp
})

const witness = z.object({
  args    : literal.array(),
  action  : str,
  cat     : stamp,
  method  : str,
  path    : label,
  prog_id : hash,
  pubkey  : hash,
  sig     : nonce,
  wid     : hash,
})

export default { 
  commit,
  data,
  entry,
  manifest,
  method,
  path,
  terms,
  regex,
  store,
  task,
  status,
  witness
}
