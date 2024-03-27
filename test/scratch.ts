import { Buff } from '@cmdcode/buff'
import bip68 from 'bip68'

const sequence = bip68.encode({ seconds: 512 })
const seqhex   = Buff.num(sequence, 4).hex

const locktime = bip68.decode(4194305)

console.log(seqhex)
console.log(locktime)
