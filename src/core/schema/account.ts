import { z } from 'zod'
import base  from '@/schema.js'
import cov   from './covenant.js'

const { hash, network, nonce, num, str } = base

const request = z.object({
  deposit_pk  : hash,
  locktime    : num,
  network,
  return_addr : str
})

const data = z.object({
  acct_id      : hash,
  agent_tkn    : cov.token,
  deposit_pk   : hash,
  deposit_addr : str,
  locktime     : num,
  network,
  return_addr  : str,
  sig          : nonce
})

export default { data, request }
