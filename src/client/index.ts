import EscrowClient   from './class/client.js'
import EscrowContract from './class/contract.js'
import EscrowDeposit  from './class/deposit.js'

import * as member   from '../lib/member.js' 
import * as policy   from '../lib/policy.js'
import * as util     from './lib/util.js'

export const Lib = {
  ...member,
  ...policy,
  ...util
}

export * from './types.js'

export {
  EscrowClient,
  EscrowContract,
  EscrowDeposit
}
