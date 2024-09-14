import { assert, check }        from '@/core/util/index.js'
import { Literal, WitnessData } from '@/core/types/index.js'
import { VMError }              from '@/vm/util/base.js'
import { sha256 }               from '@cmdcode/crypto-tools/hash'

/**
 * Main execution logic for the receipt method.
 */
function exec (params : Literal[]) {
  // Unpack params.
  const [ hash, ...members ] = params
  assert.is_hash(hash)
  // Return wrapped program.
  return (witness : WitnessData) => {
    // Unpack witness object.
    const { args, sigs } = witness
    // Get the pre-image from the list of arguments.
    const preimg = args.at(0)
    // Check if the pre-image is a valid hash.
    if (!check.is_hash(preimg)) {
      throw new VMError('invalid pre-image provided')
    }
    // Get the hash digest for the pre-image.
    const digest = sha256(preimg).hex
    // Check if the digest matches the hash.
    if (digest !== hash) {
      throw new VMError('digest does not match hash-lock')
    }
    // Get the first proof element on the stack.
    const proof = sigs.at(0)
    // Check if the proof is a valid format.
    if (!check.is_hex(proof)) {
      throw new VMError('proof failed validation')
    }
    // Parse the pubkey from the proof.
    const pub = proof.slice(0, 64)
    // Check if pubkey is a member of the program.
    if (!members.includes(pub)) {
      throw new VMError('pubkey not a member of the program')
    }
    return true
  }
}

function verify (params : Literal[]) {
  try {
    const [ hash, ...pubkeys ] = params
    const pubs = pubkeys.map(e => String(e))

    if (!check.is_hash(hash)) {
      return 'invalid hash-lock'
    } 

    pubs.forEach(e => { assert.is_valid_pubkey(e) })

    return null
  } catch (err) {
    const { message } = err as Error
    return message
  }
}

export default { exec, verify }
