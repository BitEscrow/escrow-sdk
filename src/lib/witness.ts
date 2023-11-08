import { Buff }          from '@cmdcode/buff'
import { create_proof }   from './proof.js'
import { Signer }         from '../signer.js'
import { now }            from './util.js'
import { regex }         from '../lib/util.js'
import { parse_program } from '../lib/parse.js'

import {
  ProgramTerms,
  WitnessData
} from '../types/index.js'

export function create_witness_sig (
  action   : string,
  path     : string,
  programs : ProgramTerms[],
  signer   : Signer,
  stamp = now()
) : WitnessData {
  const pubkey  = signer.pubkey
  const prog_id = get_program_id(action, path, pubkey, programs)
  const preimg  = [ prog_id, action, path, 'sign' ]
  const proof   = create_proof(signer, preimg, { stamp })
  return { prog_id, action, path, args : [ proof ], method : 'sign' }
}

export function endorse_witness_sig (
  signer  : Signer,
  witness : WitnessData,
  stamp   = now()
) : WitnessData {
  const { prog_id, action, args, path } = witness
  const preimg = [ prog_id, action, path, 'sign' ]
  const proof  = create_proof(signer, preimg, { stamp })
  return { ...witness, args : [ ...args, proof ] }
}

export function find_sign_program (
  action   : string,
  path     : string,
  pubkey   : string,
  programs : ProgramTerms[],
) {
  const progs = programs.filter(e => e[2] === 'sign')
  for (const terms of progs) {
    const program = parse_program(terms)
    const { method, actions, paths, params } = program
    if (!regex(action, actions))   continue
    if (!regex(path, paths))       continue
    if (method === 'sign') {
      const [ _, ...members ] = params
      if (!members.includes(pubkey)) {
        continue
      }
    }
    const img = [ method, ...params ]
    return Buff.json(img).digest.hex
  }
  throw new Error('matching witness program not found')
}

export function get_program_id (
  action   : string,
  path     : string,
  pubkey   : string,
  programs : ProgramTerms[],
) {
  const progs = programs.filter(e => e[2] === 'sign')
  for (const terms of progs) {
    const program = parse_program(terms)
    const { method, actions, paths, params } = program
    if (!regex(action, actions))   continue
    if (!regex(path, paths))       continue
    if (method === 'sign') {
      const [ _, ...members ] = params
      if (!members.includes(pubkey)) {
        continue
      }
    }
    const img = [ method, ...params ]
    return Buff.json(img).digest.hex
  }
  throw new Error('matching witness program not found')
}

