import { z } from 'zod'
import base  from './base.js'

const { num, str } = base

const account = z.object({
  FEERATE_MIN  : num,
  FEERATE_MAX  : num,
  GRACE_PERIOD : num,
  LOCKTIME_MIN : num,
  LOCKTIME_MAX : num,
  TOKEN_EXPIRY : num
})

const proposal = z.object({
  FEERATE_MIN   : num,
  FEERATE_MAX   : num,
  DEADLINE_MIN  : num,
  DEADLINE_MAX  : num,
  DURATION_MIN  : num,
  DURATION_MAX  : num,
  EFFECTIVE_MAX : num,
  MULTISIG_MAX  : num,
  TXTIMEOUT_MIN : num,
  TXTIMEOUT_MAX : num,
  VALID_ENGINES : str.array()
})

const policy = z.object({ account, proposal })

export default { account, policy, proposal }
