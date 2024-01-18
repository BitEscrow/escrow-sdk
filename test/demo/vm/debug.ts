/**
 * Mock example for isolating and testing the CVM directly.
 * 
 * Adjust the vector and add witness statements
 * in order to compute different outcomes.
 */
import { Buff }           from '@cmdcode/buff'
import { Signer }         from '@cmdcode/signer'
import { now }            from '@scrow/core/util'
import { MachineConfig }  from '@scrow/core'

import {
  create_witness,
  sign_witness
} from '@scrow/core/witness'

import {
  eval_schedule,
  eval_witness,
  init_vm,
} from '@scrow/core/vm'

const aliases = [ 'alice', 'bob', 'carol' ]

const [ a_mbr, b_mbr, c_mbr ] = aliases.map(e => new Signer({ seed : Buff.str(e) }))

const vm_config : MachineConfig = {
  cid      : '00'.repeat(32),
  paths    : [
    [ 'payout', 0, '' ],
    [ 'return', 0, '' ]
  ],
  programs : [
    [ 'endorse', 'dispute',       '*', 1, a_mbr.pubkey, b_mbr.pubkey ],
    [ 'endorse', 'close|resolve', '*', 2, a_mbr.pubkey, b_mbr.pubkey ],
    [ 'endorse', 'resolve',       '*', 1, c_mbr.pubkey ]
  ],
  published : now(),
  schedule : [ [ 7200, 'close', 'payout|return' ] ],
}

const templates = [
  { action: 'close', method : 'endorse', path : 'payout', signers : [ a_mbr ] }
]

let vm_state = init_vm(vm_config)

console.log('init state:', vm_state)

const witnesses = templates.map(e => {
  const { signers, ...tmpl } = e
  const pubkey = signers[0].pubkey
  let witness = create_witness(vm_config.programs, pubkey, tmpl)
  for (const signer of signers) {
    witness = sign_witness(signer, witness)
  }
  return witness
})

for (const wit of witnesses) {
  const vm_result = eval_witness(vm_state, wit)
  if (vm_result.error !== null) {
    console.log('err:', vm_result.error)
  } else {
    vm_state = vm_result.state
  }
}

if (vm_state.result === null) {
  vm_state = eval_schedule(vm_state, now() + 8000)
}

console.log('final state:')
console.dir(vm_state, { depth : null })