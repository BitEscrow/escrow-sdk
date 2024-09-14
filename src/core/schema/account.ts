import { z } from 'zod'
import base  from '@/schema/base.js'
import tx    from './tx.js'

const { hash, hex, network, nonce, num, stamp, str } = base

const token = hex.refine((e) => e.length === 264)

const covenant = z.object({
  cid    : hash,
  cvid   : nonce,
  pnonce : nonce,
  psigs  : z.tuple([ str, hex ]).array()
})

const account_req = z.object({
  deposit_pk  : hash,
  locktime    : num,
  network,
  return_addr : str
})

const register_req = account_req.extend({
  agent_tkn   : token,
  covenant    : covenant.optional(),
  network,
  return_psig : hex,
  return_rate : num,
  utxo        : tx.txout
})

const commit_req = register_req.extend({ covenant })

const data = z.object({
  account_hash : hash,
  account_id   : hash,
  agent_pk     : hash,
  agent_tkn    : token,
  created_at   : stamp,
  created_sig  : hex,
  deposit_pk   : hash,
  deposit_addr : str,
  locktime     : num,
  network,
  return_addr  : str
})

const policy = z.object({
  FEERATE_MIN  : num,
  FEERATE_MAX  : num,
  GRACE_PERIOD : num,
  LOCKTIME_MIN : num,
  LOCKTIME_MAX : num,
  TOKEN_EXPIRY : num
})

export default { data, account_req, commit_req, covenant, policy, register_req, token }
