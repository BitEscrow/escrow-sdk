import { z } from 'zod'
import base  from './base.js'

const { num, str } = base

const account = z.object({
  LOCKTIME_MIN : num,
  LOCKTIME_MAX : num,
  TOKEN_EXPIRY : num
})

const contract = z.object({
  HOST_FEE_FLAT : num,
  HOST_FEE_PCT  : num,
  UPDATE_IVAL   : num
})

const deposit = z.object({
  FEERATE_MIN   : num,
  FEERATE_MAX   : num,
  GRACE_PERIOD  : num,
  LOCK_FEE_FLAT : num,
  UPDATE_IVAL   : num
})

const proposal = z.object({
  DEADLINE_MIN  : num,
  DEADLINE_MAX  : num,
  DEADLINE_DEF  : num,
  DURATION_MIN  : num,
  DURATION_MAX  : num,
  DURATION_DEF  : num,
  EFFECTIVE_MAX : num,
  MULTISIG_MAX  : num,
  TIMEOUT_MIN   : num,
  TIMEOUT_MAX   : num,
  TIMEOUT_DEF   : num,
  VALID_ACTIONS : str.array(),
  VALID_METHODS : str.array()
})

const witness = z.object({
  UPDATE_IVAL : num
})

const policy = z.object({ account, contract, deposit, proposal, witness })

export default { account, contract, deposit, policy, proposal, witness }
