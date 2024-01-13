import { Buff }   from '@cmdcode/buff'
import { Signer } from '@cmdcode/signer'

export function gen_signers (...names : string[]) {
  const signers = []
  for (const name of names) {
    signers.push(gen_signer(name))
  }
  return signers
}

export function gen_signer (name : string) {
  const seed = Buff.str(name).digest
  return new Signer({ seed })
}
