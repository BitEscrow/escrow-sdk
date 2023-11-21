import { verify_witness } from './witness.js'

import {
  Literal,
  StoreEntry,
  StoreItem,
  WitnessData,
} from '@/types/index.js'

/**
 * Main execution logic for the sign method.
 */
export function exec (
  params : Literal[],
  store  : StoreEntry
) {
  // Unpack params.
  const [ threshold, ...members ] = params
  // Normalize threshold.
  const thold = Number(threshold)
  // Return wrapped program.
  return (witness : WitnessData) => {
    const { action, path, args } = witness
    // For each proof in the stack:
    for (const proof of args) {
      // Check validity of proof.
      const mem = members.map(e => String(e))
      const pub = verify_witness(mem, proof, witness)
      // Increment the proof counter
      const count = record_witness(store[1], `${path}/${action}`, pub)
      // If we meet the threshold, return true.
      if (count >= thold) {
        return true
      }
    }
    return false
  }
}

/**
 * Add a new witness to the array for
 * a given action/path combination.
 */
function record_witness (
  store : StoreItem[],
  label : string,
  key   : string
) : number {
  const idx = store.findIndex(e => e[0] === label)
    let arr : string[]

  if (idx === -1) {
    arr = new Array(key)
  } else {
    arr = revive_data(store[idx][1])
    if (arr.includes(key)) {
      throw `signature already exists: ${label} => ${key}`
    } else {
      arr.push(key)
    }
  }

  const data = serialize_data(arr)

  if (idx === -1) {
    store.push([ label, data ])
  } else {
    store[idx][1] = data
  }

  return arr.length
}

/**
 * Revive a store item from string.
 */
function revive_data (data : string) {
  let arr : string[]
  try {
    arr = JSON.parse(data)
  } catch {
    throw new Error('program data is corrupt')
  }
  if (!Array.isArray(arr)) {
    throw new Error('program data is corrupt')
  }
  return arr
}

/**
 * Dump a store item to string.
 */
function serialize_data (data : string[]) {
  try {
    return JSON.stringify(data)
  } catch {
    throw new Error('program failed to save data')
  }
}
