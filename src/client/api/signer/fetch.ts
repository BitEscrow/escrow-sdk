import { EscrowSigner } from '@/client/class/signer.js'

export function fetch_deposit_list_api (signer : EscrowSigner) {
  return async () => {
    const pub     = signer.pubkey
    const host    = signer.client.host
    const url     = `${host}/api/deposit/list/${pub}`
    const content = 'GET' + url
    const token   = signer._signer.gen_token(content)
    return signer.client.deposit.list(pub, token)
  }
}

export function fetch_contract_list_api (signer : EscrowSigner) {
  return async () => {
    const pub     = signer.pubkey
    const host    = signer.client.host
    const url     = `${host}/api/contract/list/${pub}`
    const content = 'GET' + url
    const token   = signer._signer.gen_token(content)
    return signer.client.contract.list(pub, token)
  }
}

export default function (client : EscrowSigner) {
  return {
    contracts : fetch_contract_list_api(client),
    deposits  : fetch_deposit_list_api(client)
  }
}
