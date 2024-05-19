import { Buff }         from '@cmdcode/buff'
import { verify_sig }   from '@cmdcode/crypto-tools/signer'
import { DEPOSIT_KIND } from '@/core/const.js'
import { get_proof_id } from '@/core/util/notarize.js'
import * as assert      from '@/core/util/assert.js'

import { get_deposit_proof, get_deposit_state } from './state.js'

import {
  DepositData,
  DepositPreImage,
  DepositStatus,
  NoteTemplate,
  SignerAPI
} from '@/core/types/index.js'

export function get_deposit_id (
  created_at : number,
  dep_hash   : string
) : string {
  const cat  = Buff.num(created_at, 4)
  const hash = Buff.hex(dep_hash, 64)
  return Buff.join([ cat, hash ]).digest.hex
}

export function get_deposit_preimg (
  deposit : DepositPreImage,
  status  : DepositStatus
) : NoteTemplate {
  const { dpid, agent_pk: pubkey } = deposit
  const { content, created_at }     = get_deposit_state(deposit, status)
  const kind  = DEPOSIT_KIND
  const tags  = [ [ 'i', dpid ] ]
  return { content, created_at, kind, pubkey, tags }
}

export function get_deposit_note (
  deposit : DepositData,
  status  : DepositStatus
) {
  const tmpl  = get_deposit_preimg(deposit, status)
  const proof = get_deposit_proof(deposit, status)
  return { ...tmpl, ...proof }
}

export function notarize_deposit (
  deposit : DepositPreImage,
  signer  : SignerAPI,
  status  : DepositStatus
) : string {
  const img = get_deposit_preimg(deposit, status)
  const dig = get_proof_id(img)
  const sig = signer.sign(dig)
  return Buff.join([ dig, sig ]).hex
}

export function verify_deposit_sig (
  deposit : DepositData,
  pubkey  : string,
  status  : DepositStatus
) {
  const pub = deposit.agent_pk
  const prf = get_deposit_proof(deposit, status)
  const img = get_deposit_preimg(deposit, status)
  const dig = get_proof_id(img)
  assert.ok(pubkey === pub,                   'pubkey does not match: ' + status)
  assert.ok(dig === prf.id,                   'digest does not match: ' + status)
  assert.ok(verify_sig(prf.sig, prf.id, pub), 'invalid signature: '     + status)
}
