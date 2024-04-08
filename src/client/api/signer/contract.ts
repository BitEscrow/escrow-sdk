import { EscrowSigner } from '../../class/signer.js'

export function request_contracts_api (esigner : EscrowSigner) {
  return () => {
    const pub  = esigner.pubkey
    const host = esigner.server_url
    const url  = `${host}/api/contract/list/${pub}`
    const content = 'GET' + url
    return esigner._signer.gen_token(content)
  }
}

export function cancel_contract_api (esigner : EscrowSigner) {
  return (cid : string) => {
    const host = esigner.server_url
    const url  = `${host}/api/contract/${cid}/cancel`
    const content = 'GET' + url
    return esigner._signer.gen_token(content)
  }
}

export default function (esigner : EscrowSigner) {
  return {
    list   : request_contracts_api(esigner),
    cancel : cancel_contract_api(esigner)
  }
}
