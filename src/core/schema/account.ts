import { z } from 'zod'
import base  from './base.js'
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
  covenant    : covenant.optional(),
  network,
  return_psig : hex,
  return_rate : num,
  server_tkn  : token,
  utxo        : tx.txout
})

const commit_req = register_req.extend({ covenant })

const data = z.object({
  account_hash : hash,
  account_id   : hash,
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

export default { data, account_req, commit_req, covenant, register_req, token }
