import { ContractData } from './contract.js'
import { WitnessData }  from './program.js'

import {
  DepositAccount,
  DepositData
} from './deposit.js'

export type ApiResponse<T> = DataResponse<T> | ErrorResponse

export interface DataResponse<T> {
  ok     : true
  data   : T
  error ?: string
  status : number
}

export interface ErrorResponse {
  ok     : false
  error  : string
  status : number
}

export interface AccountDataResponse {
  account : DepositAccount
}

export interface ContractDataResponse {
  contract : ContractData
}

export interface ContractListResponse {
  contracts : ContractData[]
}

export interface DepositDataResponse {
  deposit : DepositData
}

export interface DepositListResponse {
  deposits : DepositData[]
}

export interface WitnessDataResponse {
  witness : WitnessData
}

export interface WitnessListResponse {
  witnesses : WitnessData[]
}

export interface FundingDataResponse {
  contract : ContractData
  deposit  : DepositData
}
