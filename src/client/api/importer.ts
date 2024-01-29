import { Seed }         from '@cmdcode/signer'
import { EscrowSigner } from '../class/signer.js'
import { SignerConfig } from '../types.js'

export default function (
  config : Partial<SignerConfig>,
  xpub  ?: string
) {
  return {
    from_phrase : (
      phrase : string,
      salt  ?: string | undefined
    ) => {
      const seed = Seed.import.from_char(phrase, salt)
      return EscrowSigner.create(config, seed, xpub)
    },
    from_words : (
      words     : string | string[],
      password ?: string | undefined
    ) => {
      const seed = Seed.import.from_words(words, password)
      return EscrowSigner.create(config, seed, xpub)
    }
  }
}
