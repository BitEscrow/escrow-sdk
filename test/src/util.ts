import { Buff }   from '@cmdcode/buff'
import { Signer } from '@scrow/core/signer'

export function gen_signers (...names : string[]) {
  const signers = []
  for (const name of names) {
    signers.push(gen_signer(name))
  }
  return signers
}

export function gen_signer (name : string) {
  const secret = Buff.str(name).digest
  return new Signer(secret)
}
