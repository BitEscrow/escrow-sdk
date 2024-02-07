import { ContractData } from '@/types/index.js'

import * as schema from '@/schema/index.js'

export function validate_contract (
  contract : unknown
) : asserts contract is ContractData {
  void schema.contract.data.parse(contract)
}
