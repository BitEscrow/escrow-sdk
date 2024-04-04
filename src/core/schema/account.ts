import { z } from 'zod'
import base  from './base.js'
import cov   from './covenant.js'

const { hash, network, nonce, num, stamp, str } = base

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
  server_tkn   : cov.token
})

export default { data, request }
