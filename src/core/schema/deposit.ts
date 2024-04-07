import { z } from 'zod'
import acct  from './account.js'
import base  from './base.js'
import cov   from './covenant.js'
import tx    from './tx.js'

const { hash, hex, network, num, stamp, str } = base

const locktime = z.union([ str, num ]).transform(e => Number(e))
const status   = z.enum([ 'pending', 'open', 'locked', 'spent', 'settled', 'expired', 'error' ])

const register_req = acct.request.extend({
  covenant    : cov.data.optional(),
  feerate     : num,
  network,
  return_psig : hex,
  server_tkn  : cov.token,
  utxo        : tx.txout
})

const commit_req = register_req.extend({
  covenant : cov.data
})

const lock_req = z.object({
  dpid     : hash,
  covenant : cov.data
})

const close_req = z.object({
  dpid        : hash,
  feerate     : num,
  return_psig : hex
})

const fund = z.object({
  covenant   : cov.data.nullable(),
  status,
  updated_at : stamp,
  utxo       : tx.txout
}).and(tx.confirm_state).and(tx.spend_state).and(tx.settle_state)

const base_data = z.object({
  status,
  acct_hash    : hash,
  covenant     : cov.data.nullable(),
  created_at   : stamp,
  dpid         : hash,
  deposit_pk   : hash,
  deposit_addr : str,
  feerate      : num,
  locktime     : num,
  network,
  return_addr  : str,
  return_psig  : hex,
  satpoint     : str,
  server_pk    : hash,
  server_sig   : hex,
  server_tkn   : hex,
  updated_at   : stamp,
  utxo         : tx.txout
})

const data  = base_data.and(tx.confirm_state).and(tx.spend_state).and(tx.settle_state)
const shape = base_data.merge(tx.confirm_info).merge(tx.spend_info).merge(tx.settle_info)

export default {
  commit_req,
  close_req,
  data,
  fund,
  locktime,
  lock_req,
  register_req,
  shape,
  status
}
