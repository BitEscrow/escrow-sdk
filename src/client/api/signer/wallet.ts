import { AddressConfig } from '@cmdcode/signer'
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

export function get_address_api (esigner : EscrowSigner) {
  return (account : number, config : AddressConfig = {}) => {
    config.format  = config.format ?? 'p2tr'
    config.network = esigner.network
    return esigner._wallet.get_account(account).get_address(config)
  }
}

export function new_address_api (esigner : EscrowSigner) {
  return (account : number, config : AddressConfig = {}) => {
    config.format  = config.format ?? 'p2tr'
    config.network = esigner.network
    return esigner._wallet.get_account(account).new_address(config)
  }
}

export default function (esigner : EscrowSigner) {
  return {
    has : has_address_api(esigner),
    get : get_address_api(esigner),
    new : new_address_api(esigner)
  }
}
