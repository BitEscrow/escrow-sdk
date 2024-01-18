import { verify_sig }     from '@cmdcode/crypto-tools/signer'
import { get_path_names } from '@/lib/proposal.js'
import { regex }          from '@/lib/util.js'
import { get_witness_id } from '@/lib/witness.js'
import { VALID_METHODS }  from '../config.js'

import {
  ContractData,
  Literal,
  ProgramTerms,
  WitnessData
} from '../types/index.js'

import * as assert from '../assert.js'
import * as schema from '../schema/index.js'

export function validate_program_terms (
  terms : unknown
) : asserts terms is ProgramTerms {
  schema.proposal.terms.parse(terms)
}

export function check_program_config (
  method : string,
  params : Literal[]
) {
  if (!VALID_METHODS.includes(method)) {
    throw new Error('invalid program method: ' + method)
  }

  switch (method) {
    case 'endorse':
      check_sign_config(params)
      break
    default:
      throw new Error('Invalid method: ' + method)
  }
}

function check_sign_config (params : Literal[]) {
  const [ thold, ...pubkeys ] = params
  if (typeof thold !== 'number' || thold > pubkeys.length) {
    throw new Error('invalid threshold value: ' + String(thold))
  }
  pubkeys.forEach(e => assert.valid_pubkey(e))
}

export function validate_witness (
  contract : ContractData,
  witness  : WitnessData
) {
  const { expires_at, published, vm_state }      = contract
  const { action, path, prog_id, method, stamp } = witness

  assert.exists(vm_state)

  const pathnames = get_path_names(contract.terms.paths)
  const program   = vm_state.programs.find(e => e[0] === prog_id)

  assert.ok(program !== undefined,  'program not found: ' + prog_id)

  const [ _, mthd, actions, paths ] = program

  assert.ok(method === mthd,          'method does not match program')
  assert.ok(regex(action, actions),   'action not allowed in program')
  assert.ok(regex(path, paths),       'path not allowed in program')
  assert.ok(pathnames.includes(path), 'path does not exist in contract')

  assert.exists(expires_at)
  assert.ok(stamp >= published,       'stamp exists before published date')
  assert.ok(stamp < expires_at,       'stamp exists on or after expiration date')

  const { sigs, wid, ...tmpl } = witness
  const hash = get_witness_id(tmpl)

  assert.ok(hash === wid,             'computed hash does not equal witness id')
}

export function verify_witness (
  witness : WitnessData
) {
  const { sigs, wid } = witness
  const is_valid = sigs.every(e => {
    const pub = e.slice(0, 64)
    const sig = e.slice(64)
    return verify_sig(sig, wid, pub)
  })
  assert.ok(is_valid,                 'signature verifcation failed')
}
