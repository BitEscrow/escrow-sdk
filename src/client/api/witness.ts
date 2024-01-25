
import { EscrowSigner }     from '@/client/class/signer.js'
import { find_program }     from '@/lib/proposal.js'
import { validate_witness } from '@/validators/program.js'

import {
  create_witness,
  sign_witness
} from '@/lib/witness.js'

import {
  ContractData,
  WitnessData,
  WitnessTemplate
} from '@/types/index.js'

export function can_sign_api (signer : EscrowSigner) {
  return (
    contract : ContractData,
    template : WitnessTemplate | WitnessData
  ) => {
    const { action, path, method } = template
    const terms = contract.terms

    if (!signer.membership.exists(terms)) {
      return false
    }

    const cred  = signer.membership.claim(terms)
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
    const cred  = signer.membership.claim(terms)
      let wdat  = create_witness(terms.programs, signer.pubkey, template)
    validate_witness(contract, wdat)
    return sign_witness(cred.signer, wdat)
  }
}

export function endorse_witness_api (signer : EscrowSigner) {
  return (
    contract : ContractData,
    witness  : WitnessData
  ) => {
    const terms = contract.terms
    const cred  = signer.membership.claim(terms)
    validate_witness(contract, witness)
    return sign_witness(cred.signer, witness)
  }
}

export default function (signer : EscrowSigner) {
  return {
    can_sign : can_sign_api(signer),
    endorse  : endorse_witness_api(signer),
    sign     : sign_witness_api(signer),
  }
}
