import { z } from 'zod'
import base  from './base.js'

const { hash, hex, num, stamp } = base

const spent = z.object({
  spent       : z.literal(true),
  spent_at    : stamp,
  spent_txid  : hash,
})

const unspent = z.object({
  spent       : z.literal(false),
  spent_at    : z.null(),
  spent_txid  : z.null(),
})

const settled = z.object({
  settled      : z.literal(true),
  settled_at   : stamp,
})

const unsettled = z.object({
  settled      : z.literal(false),
  settled_at   : z.null(),
})

const spend_state = z.discriminatedUnion('spent',     [ spent,     unspent     ])
const close_state = z.discriminatedUnion('settled',   [ settled,   unsettled   ])

const txspend = z.object ({
  txid      : hash,
  vout      : num,
  value     : num,
  scriptkey : hex
})

export default { close_state, spend_state, txspend }