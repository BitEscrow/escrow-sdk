import { create_proof }   from '../../lib/proof.js'
import { Signer }         from '../../signer.js'
import { now }            from '../../lib/util.js'
import { get_program_id } from '../util.js'

import {
  ProgramTerms,
  WitnessData
} from '../../types/index.js'

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
