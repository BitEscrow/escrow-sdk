import { z } from 'zod'
import base  from './base.js'
import tx    from './tx.js'
 
const { bech32, bool, hash, hex, nonce, num, psig, stamp, str } = base
const { close_state, spend_state, txspend } = tx

const confirmed = z.object({
  confirmed    : z.literal(true),
  block_hash   : hash,
  block_height : num,
  block_time   : stamp,
  expires_at   : stamp
})

const unconfirmed = z.object({
  confirmed    : z.literal(false),
  block_hash   : z.null(),
  block_height : z.null(),
  block_time   : z.null(),
  expires_at   : z.null()
})

const locktime = z.union([ str, num ]).transform(e => Number(e))
const state    = z.discriminatedUnion('confirmed', [ confirmed, unconfirmed ])
const status   = z.enum([ 'reserved', 'pending', 'stale', 'open', 'locked', 'spent', 'settled', 'expired', 'error' ])

const account = z.object({
  acct_id    : hash,
  acct_sig   : nonce,
  address    : bech32,
  agent_id   : hash,
  agent_pk   : hash,
  created_at : stamp,
  deposit_pk : hash,
  sequence   : num,
  spend_xpub : str
})

const covenant = z.object({
  cid    : hash,
  pnonce : nonce,
  psigs  : z.tuple([ str, psig ]).array()
})

const acct_req = z.object({
  deposit_pk : hash,
  locktime   : locktime.optional(),
  spend_xpub : str
})

const reg_req = z.object({
  covenant    : covenant.optional(),
  deposit_pk  : hash,
  sequence    : num,
  spend_xpub  : str,
  utxo        : txspend
})

const commit_req = reg_req.extend({ covenant : covenant.required() })

const lock_req = z.object({ covenant })

const close_req = z.object({
  pnonce  : nonce,
  psig    : hex,
  txfee   : num
})

const digest = z.object({
  block_height : num.nullable(),
  cid          : hash.nullable(),
  confirmed    : bool,
  expires_at   : stamp.nullable(),
  settled      : bool,
  spent        : bool,
  spent_txid   : hash.nullable(),
  status,
  updated_at   : stamp,
  txid         : hash,
  value        : num,
  vout         : num
})

const data = z.object({
  status,
  agent_id    : hash,
  agent_pk    : hash,
  agent_pn    : nonce,
  covenant    : covenant.nullable(),
  created_at  : stamp,
  dpid        : hash,
  deposit_pk  : hash,
  return_psig : hex.nullable(),
  sequence    : num,
  spend_xpub  : str,
  updated_at  : stamp
}).and(state).and(spend_state).and(close_state).and(txspend)

export default { account, covenant, data, digest, state, acct_req, lock_req, reg_req, commit_req, close_req, status }
