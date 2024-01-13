import { now }     from '@/lib/util.js'
import { Signer }  from '@/signer.js'
import { Buff }    from '@cmdcode/buff'

const signer = Signer.seed('alice')
const stamp  = now()

const preimg = Buff.str('escrow' + String(stamp))
const target = signer.hmac(preimg).slice(0, 32).hex
const pubkey = signer.derive(target).pubkey

let counter : number = stamp + 1_000_000

console.time('bench')

while (counter >= (stamp - 100)) {
  const gen_preimg = Buff.str('escrow' + String(counter))
  const gen_id     = signer.hmac(gen_preimg).slice(0, 32).hex
  if (gen_id === target) {
    const gen_signer = signer.derive(gen_id)
    const gen_pub    = gen_signer.pubkey
    console.log('found pubkey at idx:', counter)
    console.log('id:', target, gen_id)
    console.log('pub:', pubkey, gen_pub)
    break
  }
  counter--
}

console.timeEnd('bench')
