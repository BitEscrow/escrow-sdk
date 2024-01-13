import { Buff }       from '@cmdcode/buff'
import { Field }      from '@cmdcode/crypto-tools'
import { sha256 }     from '@cmdcode/crypto-tools/hash'
import { get_pubkey } from '@cmdcode/crypto-tools/keys'

const LIMIT  = 1_000_000

const seckey = Field.mod(Buff.random(32))
const pubkey = get_pubkey(seckey)
const index  = Buff.random(4).num % LIMIT
const tweak  = sha256(seckey, index)
const target = Field.mod(seckey).add(tweak)

console.log('seckey :', seckey.hex)
console.log('pubkey :', pubkey.hex)
console.log('index  :', index)
console.log('tweak  :', tweak.hex)
console.log('target :', target.hex)

console.time('bench')

let guess : Field | undefined,
    idx   : number

for (idx = 0; idx < LIMIT; idx++) {
  const twk = Field.mod(sha256(seckey, idx))
  guess = target.sub(twk)
  if (guess.eq(seckey)) {
    break
  }
}

if (guess !== undefined) {
  console.log('found key at idx:', idx)
} else {
  console.log('key not found!')
}

console.timeEnd('bench')
