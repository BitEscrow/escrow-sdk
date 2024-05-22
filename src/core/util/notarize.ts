import { Buff }         from '@cmdcode/buff'
import { SignedEvent }  from '@cmdcode/signer'
import { sha256 }       from '@cmdcode/crypto-tools/hash'
import { NoteTemplate } from '@/core/types/index.js'
import * as assert      from '@/core/util/assert.js'

export function get_proof_id (
  template : NoteTemplate
) {
  const { pubkey, created_at, kind, tags, content } = template
  const pimg = Buff.json([ 0, pubkey, created_at, kind, tags, content ])
  return sha256(pimg).hex
}

export function parse_proof (proof : string) {
  assert.is_hex(proof)
  assert.size(proof, 96)
  return [ proof.slice(0, 64), proof.slice(64) ]
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
