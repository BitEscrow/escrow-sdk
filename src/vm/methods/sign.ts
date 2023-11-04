import { Buff } from '@cmdcode/buff'
import { now }  from '@/lib/util.js'

import {
  parse_proof,
  verify_proof
} from '@/lib/proof.js'

import {
  StoreEntry,
  WitnessData,
} from '../../types/index.js'

type Entry = [ key : string, val : string[] ]

export default function (
  params : string[],
  store  : StoreEntry<Entry[]>
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
      const pub = verify_witness(members, proof, witness)
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

function verify_witness (
  members : string[],
  proof   : string,
  witness : WitnessData
) {
  /**
   * Verify the provided witness signatures.
   */
  const { pub, ref } = parse_proof(proof)

  if (!members.includes(pub)) {
    throw '[vm/sign_v1] Invalid member: ' + pub
  } 
  
  const { prog_id, action, path, method } = witness
  
  const preimg = [ prog_id, action, path, method ]
  const digest = Buff.json(preimg).digest.hex

  if (ref !== digest) {
    throw '[vm/sign_v1] invalid ref: ' + ref
  } else if (!verify_proof(proof, preimg, { until : now() })) {
    throw '[vm/sign_v1] invalid proof: ' + proof
  }

  return pub
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
