import { EscrowSigner } from '../../class/signer.js'

export function has_address_api (esigner : EscrowSigner) {
  return (
    account : number,
    address : string,
    limit  ?: number
  ) => {
    return esigner._wallet.get_account(account).has_address(address, limit)
  }
}

export function new_address_api (esigner : EscrowSigner) {
  return (account : number) => {
    const format  = 'p2tr'
    const network = esigner.network
    const config  = { format, network }
    return esigner._wallet.get_account(account).new_address(config)
  }
}

export default function (esigner : EscrowSigner) {
  return {
    has : has_address_api(esigner),
    new : new_address_api(esigner)
  }
}
