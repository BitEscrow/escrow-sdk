import { EscrowSigner } from '@/client/class/signer.js'

import { ContractData, FundingData, VMData } from '@/core/types/index.js'

import {
  verify_contract_sigs,
  verify_contract_state
} from '@/core/validation/contract.js'

function request_contracts_api (esigner : EscrowSigner) {
  return () => {
    const host = esigner.server_url
    const url  = `${host}/api/contract/list`
    const content = 'GET' + url
    return esigner._signer.gen_token(content)
  }
}

function cancel_contract_api (esigner : EscrowSigner) {
  return (cid : string) => {
    const host = esigner.server_url
    const url  = `${host}/api/contract/${cid}/cancel`
    const content = 'GET' + url
    return esigner._signer.gen_token(content)
  }
}

function verify_contract_api (esigner : EscrowSigner) {
  return (
    contract : ContractData,
    funds   ?: FundingData[],
    vmdata  ?: VMData
  ) => {
    const pubkey = esigner.server_pk
    verify_contract_state(contract, funds, vmdata)
    verify_contract_sigs(contract, pubkey)
  }
}

export default function (esigner : EscrowSigner) {
  return {
    list   : request_contracts_api(esigner),
    cancel : cancel_contract_api(esigner),
    verify : verify_contract_api(esigner)
  }
}
