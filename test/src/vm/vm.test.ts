import assert       from 'assert'
import { Test }     from 'tape'
import { now }      from '@scrow/sdk/util'
import { VMVector } from './types.js'

import {
  ProgramEntry,
  VMConfig
} from '@scrow/sdk/core'

import {
  compile_witness,
  resolve_aliases,
  run_vm
} from './util.js'

import escrow_vec from './vectors/escrow.json' assert { type: 'json' }

const vmid      = '00'.repeat(32)
const activated = now()

export default function (tape : Test) {
  tape.test('Running VM test vectors', t => {
    run_test(t, escrow_vec)
  })
}

function run_test (t : Test, v : VMVector) {
  // Unpack the vector object.
  const { title, members, pathnames, programs, schedule, tests } = v
  t.comment(title)
  // Find and replace aliases with their relevant pubkeys.
  const progs  = resolve_aliases(members, programs as ProgramEntry[])
  // Configure the init state of the vm.
  const config = { activated, pathnames, programs : progs, schedule, vmid } as VMConfig
  // For each test in the test set:
  t.plan(tests.length)
  for (const { comment, error, result, stamp, steps, witness } of tests) {
    try {
      const wit_data = compile_witness(progs, witness)
      const vm_state = run_vm(config, wit_data, stamp)
      assert.equal(vm_state.output, result, 'vm output matches expected result')
      assert.equal(vm_state.error,  error,  'vm error matches expected result')
      assert.equal(vm_state.step,   steps,  'vm commit count matches expected result')
      t.pass(comment)
    } catch (err) {
      const { message } = err as Error
      t.fail(message)
    }
  }
}
