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
  FEERATE_MIN  : num,
  FEERATE_MAX  : num,
  GRACE_PERIOD : num,
  UPDATE_IVAL  : num
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
  TXTIMEOUT_MAX : num
})

const vm = z.object({
  VALID_MACHINES : str.array()
})

const witness = z.object({
  UPDATE_IVAL : num
})

const policy = z.object({ account, contract, deposit, proposal, vm, witness })

export default { account, contract, deposit, policy, proposal, witness }
