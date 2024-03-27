import { Test } from 'tape'

import {
  ProgramEntry,
  VMConfig }
  from '@scrow/sdk/core'

import { now }  from '@scrow/sdk/util'

import * as Util from './util.js'

import vectors from './vectors.json' assert { type: 'json' }

const vmid      = '00'.repeat(32)
const activated = now()

export default function (tape : Test) {
  tape.test('[vm] Running VM test vectors', t => {
    for (const vec of vectors) {
      // Unpack the vector object.
      const { members, pathnames, programs, schedule, tests } = vec
      // Find and replace aliases with their relevant pubkeys.
      const progs  = Util.resolve_aliases(members, programs as ProgramEntry[])
      // Configure the init state of the vm.
      const config = { activated, pathnames, programs : progs, schedule, vmid } as VMConfig
      // For each test in the test set:
      for (const { comment, error, result, stamp, steps, witness } of tests) {
        t.test(comment, t => {
          t.plan(4)
          // Define our initial state.
          const wit_data = Util.compile_witness(progs, witness)
          const vm_state = Util.run_vm(config, stamp, wit_data)
          t.equal(vm_state.output, result,        'vm output matches expected result')
          t.equal(vm_state.error, error,          'vm error matches expected result')
          t.equal(vm_state.commits.length, steps, 'vm commit count matches expected result')
        })
      }
    }
  })
}
