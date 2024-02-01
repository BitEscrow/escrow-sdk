import { DepositDigest } from '../deposit.js'
import { ProposalData }  from '../proposal.js'
import { WitnessData }   from '../program.js'
import { StateData }     from '../vm.js'

import {
  ContractData,
  ContractDigest,
  ContractStatus
} from '../contract.js'

export interface ContractRequest {
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
