import { regex } from '../lib/util.js'

import {
  ProgramEntry,
  WitnessData
} from '../types/index.js'

import * as assert from '../assert.js'

export function verify_witness (
  programs : ProgramEntry[],
  witness  : WitnessData
) {
  const { action, path, prog_id, method } = witness
  const prog = programs.find(e => e[0] === prog_id)
  assert.ok(prog !== undefined, 'program not found: ' + prog_id)
  const [ _, actions, paths, mthd ] = prog
  assert.ok(method === mthd,        'method does not match program')
  assert.ok(regex(action, actions), 'action not allowed in program')
  assert.ok(regex(path, paths),     'path not allowed in program')
}
