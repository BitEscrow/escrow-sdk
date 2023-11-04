import { z } from 'zod'
import base  from './base.js'

const { hash, hex, nonce, psig, str } = base

const agent = z.object({
  agent_id  : hash,
  agent_key : hash,
  record_pn : nonce
})

const covenant = z.object({
  cid      : hash,
  pnonce   : nonce,
  psigs    : z.tuple([ str, psig ]).array()
})

const refund = z.object({
  deposit_id : hash,
  pnonce     : nonce,
  psig,
  txhex      : hex
})

export default { agent, covenant, refund }
