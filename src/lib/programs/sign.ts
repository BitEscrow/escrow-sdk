import {
  Literal,
  WitnessData,
} from '@/types/index.js'

/**
 * Main execution logic for the sign method.
 */
export function exec (
  params : Literal[],
  store  : string[]
) {
  // Unpack params.
  const [ threshold, ...members ] = params
  // Normalize threshold.
  const thold = Number(threshold)
  // Return wrapped program.
  return (witness : WitnessData) => {
    // Unpack witness object.
    const { action, path, sigs } = witness
    // Iterate through each signature in the witness.
    for (const proof of sigs) {
      // Slice pubkey from signature.
      const pub = proof.slice(0, 64)
      // Check if pubkey is a member of the program.
      if (!members.includes(pub)) {
        throw 'pubkey not a member of the program'
      }
      // Record the pubkey under path/action label, and return vote count.
      const count = record_entry(store, `${path}/${action}`, pub)
      // Return the status of the count.
      if (count >= thold) return true
    }
    return false
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
      throw `record already exists: ${label} => ${pubkey}`
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

// /**
//  * Revive a store item from string.
//  */
// function revive_data (data : string) {
//   let arr : string[]
//   try {
//     arr = JSON.parse(data)
//   } catch {
//     throw new Error('program data is corrupt')
//   }
//   if (!Array.isArray(arr)) {
//     throw new Error('program data is corrupt')
//   }
//   return arr
// }

// /**
//  * Dump a store item to string.
//  */
// function serialize_data (data : string[]) {
//   try {
//     return JSON.stringify(data)
//   } catch {
//     throw new Error('program failed to save data')
//   }
// }
