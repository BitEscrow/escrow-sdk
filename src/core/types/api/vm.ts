import { ContractData } from '../contract.js'
import { VMReceipt }    from '../vm.js'

export interface VMDataResponse {
  contract ?: ContractData
  vmdata    : VMReceipt
}

export interface VMListResponse {
  machines : VMReceipt[]
}
