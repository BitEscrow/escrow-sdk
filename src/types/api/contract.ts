import { DepositDigest } from '../deposit.js'
import { MemberData }    from '../draft.js'
import { ProposalData }  from '../proposal.js'
import { WitnessData }   from '../program.js'
import { StateData }     from '../vm.js'

import {
  ContractData,
  ContractDigest,
  ContractStatus
} from '../contract.js'

export interface ContractRequest {
  members    ?: MemberData[]
  proposal    : ProposalData
  signatures ?: string[]
}

export interface FundListResponse {
  funds : DepositDigest[]
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

export interface ContractVMStateResponse {
  status     : ContractStatus
  updated_at : number
  vm_state   : StateData
}

export interface WitnessRequest {
  witness : WitnessData
}

export interface WitnessListResponse {
  statements : WitnessData[]
}
