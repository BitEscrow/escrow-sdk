import { z } from 'zod'
import base  from './base.js'

const { hash, hex, nonce, str } = base

const token = hex.refine((e) => e.length === 264)

const data = z.object({
  cid    : hash,
  cvid   : nonce,
  pnonce : nonce,
  psigs  : z.tuple([ str, hex ]).array()
})

export default { data, token }
