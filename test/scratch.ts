import { EscrowSigner } from '@scrow/core'
import { Buff }         from '@cmdcode/buff'

const seed = Buff.str('alice').digest

console.log('seed:', seed.hex)

const signer = EscrowSigner.create({}, seed)

const backup = signer.save('test')

console.log('backup:', backup)

const signer2 = EscrowSigner.load({}, 'test', backup)

console.log('is restored:', signer.pubkey === signer2.pubkey)
