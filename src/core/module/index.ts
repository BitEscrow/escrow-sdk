import AccountMod  from './account/index.js'
import ContractMod from './contract/index.js'
import DepositMod  from './deposit/index.js'
import MachineMod  from './machine/index.js'
import WitnessMod  from './witness/index.js'

export default {
  account  : AccountMod,
  contract : ContractMod,
  deposit  : DepositMod,
  machine  : MachineMod,
  witness  : WitnessMod
}
