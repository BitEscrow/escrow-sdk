import { assert } from '@/core/util/index.js'

import { ContractVerifyConfig } from '@/client/types/contract.js'

import {
  verify_contract_activation,
  verify_contract_close,
  verify_contract_data,
  verify_contract_funding,
  verify_contract_sigs,
  verify_contract_spending
} from '@/core/validation/contract.js'

export function verify_contract (
  config : ContractVerifyConfig
) {
  const { contract, funds, pubkey, vmdata } = config

  verify_contract_data(contract)
  verify_contract_sigs(contract, pubkey)

  if (contract.secured && funds !== undefined) {
    verify_contract_funding(contract, funds)
  }

  if (contract.activated && vmdata !== undefined) {
    verify_contract_activation(contract, vmdata)
  }

  if (contract.closed && vmdata !== undefined) {
    assert.exists(vmdata, 'you must provide a vmdata object to verify.')
    verify_contract_close(contract, vmdata)
  }

  if (contract.spent) {
    assert.exists(funds,  'you must provide a list of funds to verify')
    assert.exists(vmdata, 'you must provide a vmdata object to verify.')
    verify_contract_spending(contract, funds, vmdata)
  }
}
