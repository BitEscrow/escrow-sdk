import { EscrowSigner } from '../../class/signer.js'

export function request_machines_api (esigner : EscrowSigner) {
  return () => {
    const pub  = esigner.pubkey
    const host = esigner.server_url
    const url  = `${host}/api/vm/list?pk=${pub}`
    const content = 'GET' + url
    return esigner._signer.gen_token(content)
  }
}

export default function (esigner : EscrowSigner) {
  return {
    list : request_machines_api(esigner)
  }
}
