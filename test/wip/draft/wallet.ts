import { EscrowSigner } from '@/client/class/signer.js'

export function has_account_api (signer : EscrowSigner) {
  return (xpub : string) => {
    return signer._wallet.has_account(xpub)
  }
}

export function get_account_api (signer : EscrowSigner) {
  return (idx : number) => {
    return signer._wallet.get_account(idx)
  }
}

export default function (signer : EscrowSigner) {
  return {
    has : has_account_api(signer),
    get : get_account_api(signer)
  }
}
