import { z } from 'zod'
import base  from './base.js'

const { hash, hex, network, nonce, num, stamp, str } = base

const token = hex.refine((e) => e.length === 264)

const request = z.object({
  deposit_pk  : hash,
  locktime    : num,
  network,
  return_addr : str
})

const data = z.object({
  acct_hash    : hash,
  acct_id      : hash,
  created_at   : stamp,
  deposit_pk   : hash,
  deposit_addr : str,
  locktime     : num,
  network,
  return_addr  : str,
  server_pk    : hash,
  server_sig   : nonce,
  server_tkn   : token
})

export default { data, request, token }
