import { DepositData, SignerAPI } from '@/core/types/index.js'

import {
  verify_deposit_data,
  verify_deposit_sigs
} from '@/core/validation/deposit.js'

export function verify_deposit (
  deposit : DepositData,
  pubkey  : string,
  signer  : SignerAPI
) {
  verify_deposit_data(deposit, signer)
  verify_deposit_sigs(deposit, pubkey)
}
