import { z } from 'zod'
import base  from '@/schema.js'

const { hash, hex, label, literal, num, regex, stamp, str } = base

const task  = z.tuple([ num, str, regex ])
const terms = z.tuple([ str, regex, regex ]).rest(literal)

const witness = z.object({
  args    : literal.array(),
  action  : str,
  method  : str,
  path    : label,
  prog_id : hash,
  sigs    : hex.array(),
  stamp,
  wid     : hash
})

export default { task, terms, witness }
