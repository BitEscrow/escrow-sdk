import { assert, is_hash }      from '@/core/util/index.js'
import { Literal, WitnessData } from '@/core/types/index.js'
import { VMError }              from '../../util/base.js'
import { sha256 }               from '@cmdcode/crypto-tools/hash'

/**
 * Main execution logic for the endorse method.
 */
function exec (
  params : Literal[],
  store  : string[]
) {
  // Unpack params.
  const [ hashlock, threshold, ...members ] = params
  assert.is_hash(hashlock)
  // Normalize threshold.
  const thold = Number(threshold)
  // Return wrapped program.
  return (witness : WitnessData) => {
    // Unpack witness object.
    const { action, args, path, sigs } = witness
    //
    const preimg = args.at(0)
    if (!is_hash(preimg)) {
      throw new VMError('invalid pre image provided')
    }
    //
    const digest = sha256(preimg).hex
    //
    if (digest !== hashlock) {
      throw new VMError('digest does not match hashlock')
    }
    // Iterate through each signature in the witness.
    for (const proof of sigs) {
      // Slice pubkey from signature.
      const pub = proof.slice(0, 64)
      // Check if pubkey is a member of the program.
      if (!members.includes(pub)) {
        throw new VMError('pubkey not a member of the program')
      }
      // Record the pubkey under path/action label, and return vote count.
      const count = record_entry(store, `${path}/${action}`, pub)
      // Return the status of the count.
      if (count >= thold) return true
    }
    return false
  }
}

function verify (params : Literal[]) {
  try {
    const [ hashlock, threshold, ...pubkeys ] = params
    const thold = Number(threshold)
    const pubs  = pubkeys.map(e => String(e))

    if (!is_hash(hashlock)) {
      return 'invalid hashlock'
    } else if (typeof thold !== 'number') {
      return 'invalid threshold value: ' + String(thold)
    } else if (thold <= 0) {
      return 'threshold must be greater than zero'
    } else if (thold > pubs.length) {
      return 'threshold must not exceed pubkey count'
    }

    pubs.forEach(e => { assert.is_valid_pubkey(e) })

    return null
  } catch (err) {
    const { message } = err as Error
    return message
  }
}

/**
 * Add a new witness to the array for
 * a given action/path combination.
 */
function record_entry (
  store  : string[],
  label  : string,
  pubkey : string
) : number {
  const entries : [ string, string[] ][] = JSON.parse(store[1])
  // Check if the label entry exists in the store.
  const idx = entries.findIndex(e => e[0] === label)
  // Initialize array object.
    let arr : string[]
  // If label does not exist:
  if (idx === -1) {
    // Add new label entry to array.
    arr = new Array(pubkey)
  } else {
    // Else, revive existing label entry.
    arr = entries[idx][1]
    // Check if pubkey already exists in array:
    if (arr.includes(pubkey)) {
      // Throw on duplicate key entry.
      throw new VMError(`record already exists: ${label} => ${pubkey}`)
    } else {
      // Add pubkey to array.
      arr.push(pubkey)
    }
  }
  // If label did not exists prevously:
  if (idx === -1) {
    // Push new label entry to store.
    entries.push([ label, arr ])
  } else {
    // Else, update existing label entry.
    entries[idx][1] = arr
  }
  // Update store.
  store[1] = JSON.stringify(entries)
  // Return the new length of the label array.
  return arr.length
}

export default { exec, verify }
