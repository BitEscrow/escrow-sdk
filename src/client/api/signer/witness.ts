import { verify_contract } from '@/core/validators/contract.js'
import { verify_witness }  from '@/core/validators/witness.js'

import {
  can_endorse,
  create_witness,
  endorse_witness
} from '@/core/lib/witness.js'

import {
  ContractData,
  WitnessData,
  WitnessTemplate
} from '@/core/types/index.js'

import { EscrowSigner } from '../../class/signer.js'

export function can_sign_api (esigner : EscrowSigner) {
  return (
    contract : ContractData,
    witness  : WitnessData
  ) => {
    const programs = contract.terms.programs
    return can_endorse(programs, esigner._signer, witness)
  }
}

export function create_witness_api (esigner : EscrowSigner) {
  return (
    contract : ContractData,
    template : WitnessTemplate
  ) => {
    esigner.check_issuer(contract.server_pk)
    verify_contract(contract)
    const programs = contract.terms.programs
    const pubkey   = esigner._signer.pubkey
    const witness  = create_witness(programs, pubkey, template)
    return endorse_witness(esigner._signer, witness)
  }
}

export function endorse_witness_api (esigner : EscrowSigner) {
  return (
    contract : ContractData,
    witness  : WitnessData
  ) => {
    esigner.check_issuer(contract.server_pk)
    verify_contract(contract)
    verify_witness(contract, witness)
    return endorse_witness(esigner._signer, witness)
  }
}

export default function (esigner : EscrowSigner) {
  return {
    can_sign : can_sign_api(esigner),
    create   : create_witness_api(esigner),
    endorse  : endorse_witness_api(esigner)
  }
}
