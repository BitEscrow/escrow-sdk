import { FundDigest }  from '../deposit.js'

import {
  ContractData,
  ContractDigest
} from '../contract.js'

export interface FundListResponse {
  funds : FundDigest[]
}

export interface ContractDataResponse {
  contract : ContractData
}

export interface ContractListResponse {
  contracts : ContractData[]
}

export interface ContractDigestResponse {
  contract : ContractDigest
}

export type ContractStatusResponse = {
  contract : ContractDigest
  updated  : true
} | {
  contract : undefined
  updated  : false
}
