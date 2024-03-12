import { z } from 'zod'
import base  from './base.js'
import draft from './draft.js'
import depo  from './deposit.js'
import prop  from './proposal.js'
import tx    from './tx.js'
 
const { hash, hex, nonce, num, stamp, str } = base
const { covenant, locktime } = depo
const { txspend } = tx

const contract_create_request = z.object({
  members    : draft.members.default([]),
  proposal   : prop.data,
  signatures : hex.array().default([])
})

const deposit_acct_req = z.object({
  deposit_pk : hash,
  locktime   : locktime.optional(),
  spend_xpub : str,
  stamp      : stamp.optional()
})

const deposit_register_req = z.object({
  covenant    : covenant.optional(),
  deposit_pk  : hash,
  sequence    : num,
  spend_xpub  : str,
  utxo        : txspend
})

const deposit_commit_req = deposit_register_req.extend({ covenant : covenant.required() })

const deposit_lock_req = z.object({ covenant })

const deposit_close_req = z.object({
  pnonce  : nonce,
  psig    : hex,
  txfee   : num
})

export default {
  contract : {
    create : contract_create_request
  },
  deposit : {
    account  : deposit_acct_req,
    close    : deposit_close_req,
    commit   : deposit_commit_req,
    lock     : deposit_lock_req,
    register : deposit_register_req
  }
}
