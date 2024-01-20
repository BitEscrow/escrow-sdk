import { Test } from 'tape'
import { now }  from '@scrow/core/util'

import * as Util from './util.js'

import vectors from './vectors.json' assert { type: 'json' }

const cid       = '00'.repeat(32)
const activated = now()

export default function (tape : Test) {
  tape.test('[vm] Running VM test vectors', t => {
    t.plan(vectors.length * 4)
    for (const vec of vectors) {
      // Unpack the vector object.
      const { members, pathnames, programs, schedule, tests } = vec
      // Find and replace aliases with their relevant pubkeys.
      const progs  = Util.resolve_aliases(members, programs)
      // Configure the init state of the vm.
      const config = Util.parse_config({ activated, cid, pathnames, programs : progs, schedule })
      // For each test in the test set:
      for (const { comment, error, result, stamp, steps, witness } of tests) {
        // Display test comment in console.
        t.comment(comment)
        // Define our initial state.
        const wit_data = Util.compile_witness(progs, witness)
        console.log('witness:', wit_data)
        const vm_state = Util.run_vm(config, stamp, wit_data)
        console.dir(vm_state, { depth: null })
        t.equal(vm_state.output, result,        'vm_state output matches expected output result')
        // t.equal(vm_state.error, error,          'vm_state error matches expected error result')
        t.equal(vm_state.steps, steps,          'vm_state step count matches expected count')
        t.equal(vm_state.commits.length, steps, 'vm_state commit count matches expected count')
      }
    }
  })
}
