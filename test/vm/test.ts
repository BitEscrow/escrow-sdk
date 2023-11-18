/**
 * Mock example for isolating and testing the CVM directly.
 * 
 * Adjust the vector and add witness statements
 * in order to compute different outcomes.
 */

import { now }  from '@/lib/util.js'
import { sign } from '@/lib/program/index.js'

import {
  PayPath,
  ProgramTerms,
  ScheduleTerms,
  Signer,
  StateData,
} from '@scrow/core'

import {
  eval_witness,
  init_vm,
} from '@scrow/core/vm'

interface VMTestVector {
  cid      : string
  init     : Partial<StateData>
  paths    : PayPath[]
  programs : ProgramTerms[]
  result   : Partial<StateData>
  schedule : ScheduleTerms[]
  stamp    : number
}

const users   = [ 'alice', 'bob', 'carol' ]
const signers = users.map(e => Signer.seed(e))

const vector : VMTestVector = {
  cid      : '00'.repeat(32),
  init     : {},
  paths    : [
    [ 'payout', 0, '' ],
    [ 'return', 0, '' ]
  ],
  programs : [
    [ 'sign', 'dispute',       '*', 1, signers[0].pubkey ],
    [ 'sign', 'resolve',       '*', 1, signers[2].pubkey ],
    [ 'sign', 'close|resolve', '*', 2, signers[0].pubkey, signers[1].pubkey ],
    // [ 'hash', 'close',         'refund', 2, '' ],
    // [ 'work', 'close',         'refund', 2, '' ]
  ],
  result   : {},
  schedule : [ [ 7200, 'close', 'payout|return' ] ],
  stamp    : now()
}

export default function test () {
  const { cid, stamp, paths, programs, schedule } = vector

  let vm_state = init_vm(cid, paths, programs, stamp, schedule)

  console.log('init state:', vm_state)
  
  const witness = [
    sign.create_witness('dispute', 'payout', programs, signers[0]),
    sign.create_witness('resolve', 'return', programs, signers[2])
  // witness.push(create_sign_entry('dispute', 'payout', programs, signers[0]))
  ]

  try {
    for (const wit of witness) {
      const vm_result = eval_witness(vm_state, wit)
      if (vm_result.error !== null) {
        console.log('err:', vm_result.error)
      } else {
        vm_state = vm_result.state
      }
    }

    // vm_state = eval_schedule(vm_state, now() + 8000)
    
    console.log('final state:')
    console.dir(vm_state, { depth : null })
  } catch (err) {
    console.log(err)
  }
}

test()
