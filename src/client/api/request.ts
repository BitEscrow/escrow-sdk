import { EscrowSigner } from '@/client/class/signer.js'

export function request_deposits_api (signer : EscrowSigner) {
  return () => {
    const url = `${signer.client.host}/api/deposit/list`
    const content = 'GET' + url
    return signer._signer.gen_token(content)
  }
}

export function request_contracts_api (signer : EscrowSigner) {
  return () => {
    const url = `${signer.client.host}/api/contract/list`
    const content = 'GET' + url
    return signer._signer.gen_token(content)
  }
}

export default function (client : EscrowSigner) {
  return {
    contracts : request_contracts_api(client),
    deposits  : request_deposits_api(client)
  }
}
