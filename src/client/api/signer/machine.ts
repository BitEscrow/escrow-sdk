import { EscrowSigner } from '@/client/class/signer.js'

export function list_machines_api (esigner : EscrowSigner) {
  return () => {
    const host    = esigner.server_url
    const url     = `${host}/api/machine/list`
    const content = 'GET' + url
    return esigner._signer.gen_token(content)
  }
}

export default function (esigner : EscrowSigner) {
  return {
    list : list_machines_api(esigner)
  }
}
