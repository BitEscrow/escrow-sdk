import { Buff }        from '@cmdcode/buff'
import { SignedEvent } from '@cmdcode/signer'
import { sha256 }      from '@cmdcode/crypto-tools/hash'
import { ProofEntry }  from '@/core/types/index.js'
import * as assert     from '@/core/util/assert.js'

export function get_record_id <T extends object> (obj : T) : Buff {
  if (
    Array.isArray(obj) ||
    obj === null       ||
    typeof obj !== 'object'
  ) { throw new Error('not an object') }
  return sha256(Buff.json(obj))
}

export function get_proof_id (
  content : string,
  kind    : number,
  pubkey  : string,
  stamp   : number,
  tags    : string[][] = []
) {
  const pimg = Buff.json([ 0, pubkey, stamp, kind, tags, content ])
  return sha256(pimg).hex
}

export function parse_proof (proof : string) {
  assert.is_hex(proof)
  assert.size(proof, 96)
  return [ proof.slice(0, 64), proof.slice(64) ]
}

export function update_proof <T> (
  entries : ProofEntry<T>[],
  proof   : ProofEntry<T>
) : ProofEntry<T>[] {
  const filtered = entries.filter(e => e[0] !== proof[0])
  return [ ...filtered, proof ]
}

export function create_note (
  content : string,
  kind    : number,
  proof   : string,
  pubkey  : string,
  stamp   : number,
  tags    : string[][] = []
) : SignedEvent {
  const [ id, sig ] = parse_proof(proof)
  return { content, id, pubkey, created_at: stamp, kind, sig, tags }
}
