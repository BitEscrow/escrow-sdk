import { EscrowSigner }     from '@/client/class/signer.js'
import { find_program }     from '@/core/lib/proposal.js'
import { validate_witness } from '@/core/validators/program.js'

import {
  create_witness,
  sign_witness
} from '@/core/lib/witness.js'

import {
  ContractData,
  WitnessData,
  WitnessTemplate
} from '@/core/types/index.js'

export function can_sign_api (signer : EscrowSigner) {
  return (
    contract : ContractData,
    template : WitnessTemplate | WitnessData
  ) => {
    const { action, path, method } = template
    const terms = contract.terms

    if (!signer.credential.exists(contract.members)) {
      return false
    }

    const cred  = signer.credential.claim(contract.members)
    const query = { action, path, method, includes: [ cred.data.pub ] }
    const prog  = find_program(query, terms.programs)
    return prog !== undefined
  }
}

export function sign_witness_api (signer : EscrowSigner) {
  return (
    contract : ContractData,
    template : WitnessTemplate
  ) => {
    const terms = contract.terms
    const cred  = signer.credential.claim(contract.members)
    const wdat  = create_witness(terms.programs, cred.data.pub, template)
    validate_witness(contract, wdat)
    return sign_witness(cred.signer, wdat)
  }
}

export function endorse_witness_api (signer : EscrowSigner) {
  return (
    contract : ContractData,
    witness  : WitnessData
  ) => {
    const cred = signer.credential.claim(contract.members)
    validate_witness(contract, witness)
    return sign_witness(cred.signer, witness)
  }
}

export default function (signer : EscrowSigner) {
  return {
    can_sign : can_sign_api(signer),
    endorse  : endorse_witness_api(signer),
    sign     : sign_witness_api(signer)
  }
}
