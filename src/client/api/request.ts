import { EscrowSigner } from '@/client/class/signer.js'

export function request_deposits_api (signer : EscrowSigner) {
  return () => {
    const pub  = signer.pubkey
    const host = signer.client.host
    const url  = `${host}/api/deposit/list?pubkey=${pub}`
    const content = 'GET' + url
    return signer._signer.gen_token(content)
  }
}

export function request_contracts_api (signer : EscrowSigner) {
  return () => {
    const pub  = signer.pubkey
    const host = signer.client.host
    const url  = `${host}/api/contract/list?pubkey=${pub}`
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
    contracts : request_contracts_api(client),
    deposits  : request_deposits_api(client),
    get_token : sign_request_api(client)
  }
}
