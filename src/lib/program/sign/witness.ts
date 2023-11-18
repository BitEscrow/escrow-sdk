import { find_program }  from '../../proposal.js'
import { Signer }        from '../../../signer.js'
import { now }           from '../../util.js'

import {
  create_proof,
  parse_proof,
  verify_proof
}  from '../../proof.js'

import {
  ProgramTerms,
  WitnessData
} from '../../../types/index.js'

import { Buff } from '@cmdcode/buff'

export function get_sign_preimg (
  action  : string,
  path    : string,
  prog_id : string
) {
  return JSON.stringify([ prog_id, action, path ])
}

export function create_witness (
  action   : string,
  path     : string,
  programs : ProgramTerms[],
  signer   : Signer,
  stamp = now()
) : WitnessData {
  const query = { method : 'sign', action, path, includes: [ signer.pubkey ] }
  const prog  = find_program(query, programs)

  if (prog !== undefined) {
    const prog_id = prog.prog_id
    const preimg  = get_sign_preimg(action, path, prog_id)
    const proof   = create_proof(signer, preimg, { stamp })
    return { prog_id , action, path, args : [ proof ], method : 'sign' }
  } else {
    throw new Error('matching program not found')
  }
}

export function endorse_witness (
  signer  : Signer,
  witness : WitnessData,
  stamp   = now()
) : WitnessData {
  const { prog_id, action, args, path } = witness
  const preimg = get_sign_preimg(action, path, prog_id)
  const proof  = create_proof(signer, preimg, { stamp })
  return { ...witness, args : [ ...args, proof ] }
}

export function verify_witness (
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

  const { action, path, prog_id } = witness
  const preimg = get_sign_preimg(action, path, prog_id)
  const digest = Buff.str(preimg).digest.hex

  if (ref !== digest) {
    throw '[vm/sign_v1] invalid ref: ' + ref
  } else if (!verify_proof(proof, preimg, { until : now() })) {
    throw '[vm/sign_v1] invalid proof: ' + proof
  }

  return pub
}
