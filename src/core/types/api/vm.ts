import { ContractData }      from '../contract.js'
import { VMData, VMReceipt } from '../vm.js'
import { WitnessData }       from '../witness.js'

export interface VMReceiptResponse {
  settlement ?: ContractData
  statements ?: WitnessData[]
  receipt     : VMReceipt
}

export interface VMStatementResponse {
  statements : WitnessData[]
}

export interface VMDataResponse {
  vmdata : VMData
}
