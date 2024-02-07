import { EscrowSigner } from '@/client/class/signer.js'

import * as assert from '@/assert.js'

export function request_deposit_list_api (signer : EscrowSigner) {
  return () => {
    const pub  = signer.pubkey
    const host = signer.client.host
    const url  = `${host}/api/deposit/list/${pub}`
    const content = 'GET' + url
    return signer._signer.gen_token(content)
  }
}

export function request_contract_list_api (signer : EscrowSigner) {
  return () => {
    const pub  = signer.pubkey
    const host = signer.client.host
    const url  = `${host}/api/contract/list/${pub}`
    const content = 'GET' + url
    return signer._signer.gen_token(content)
  }
}

export function request_contract_cancel_api (signer : EscrowSigner) {
  return (cid : string) => {
    assert.is_hash(cid)
    const host = signer.client.host
    const url  = `${host}/api/contract/${cid}/cancel`
    const content = 'GET' + url
    return signer._signer.gen_token(content)
  }
}

export function sign_request_api (signer : EscrowSigner) {
  return (
    url    : string, 
    body   : string = '',
    method : string = 'GET'
  ) => {
    const content = method + url + body
    return signer._signer.gen_token(content)
  }
}

export default function (client : EscrowSigner) {
  return {
    contract_list   : request_contract_list_api(client),
    contract_cancel : request_contract_cancel_api(client),
    deposit_list    : request_deposit_list_api(client),
    get_token       : sign_request_api(client)
  }
}
