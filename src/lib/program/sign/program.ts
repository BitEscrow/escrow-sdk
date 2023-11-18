import { verify_witness } from './witness.js'

import {
  Literal,
  StoreEntry,
  WitnessData,
} from '@/types/index.js'

type Entry = [ key : string, val : string[] ]

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
      const count = record_witness(store[1] as Entry[], `${path}/${action}`, pub)
      // If we meet the threshold, return true.
      if (count >= thold) {
        return true
      }
    }
    return false
  }
}

function record_witness (
  store : Entry[],
  label : string,
  key   : string
) : number {
  /**
   * Add a new witness to the array for
   * a given action/path combination.
   */

  const idx = store.findIndex(e => e[0] === label)
    let arr : Entry[1]
  if (idx === -1) {
    arr = new Array(key)
  } else {
    arr = store[idx][1]
    if (!Array.isArray(arr)) {
      throw new Error('program state is corrupt')
    } else if (arr.includes(key)) {
      throw `signature already exists: ${label} => ${key}`
    } else {
      arr.push(key)
    }
  }

  if (idx === -1) {
    store.push([ label, arr ])
  }

  return arr.length
}
