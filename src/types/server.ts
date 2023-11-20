import { ContractData } from './contract.js'
import { DepositData }  from './deposit.js'
import { WitnessData }  from './program.js'

export interface ContractResponse {
  contract : ContractData
  error   ?: string
}

export interface DepositResponse {
  deposit : DepositData
  error  ?: string
}

export interface FundingResponse {
  contract : ContractData
  deposit  : DepositData
  error   ?: string
}

export interface WitnessResponse {
  witness : WitnessData
  error  ?: string
}
