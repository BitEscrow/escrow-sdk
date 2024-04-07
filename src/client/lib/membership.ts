import { SignerAPI } from '@/core/types/index.js'
import { assert }    from '@/core/util/index.js'

import {
  CredentialData,
  DraftSession,
  MemberData
} from '../types.js'

export function create_credential (
  signer : SignerAPI,
  xpub   : string
) : CredentialData {
  const pub = signer.pubkey
  return { pub, xpub }
}

export function claim_membership (
  entries : MemberData[],
  signer  : SignerAPI
) : MemberData | null {
  for (const ent of entries) {
    if (ent.pub === signer.pubkey) {
      return ent
    }
  }
  return null
}

export function update_membership (
  members : MemberData[],
  mship   : MemberData
) {
  const ret = members.filter(e => e.pub !== mship.pub)
  return [ ...ret, mship ]
}

export function get_membership (
  cred    : CredentialData,
  session : DraftSession
) : MemberData {
  const entry = session.members.find(e => e.pub === cred.pub)
  assert.ok(entry !== undefined, 'credential does not exist')
  return entry
}

export function has_membership (
  cred    : CredentialData,
  session : DraftSession
) {
  const exists = session.members.find(e => e.pub === cred.pub)
  return exists !== undefined
}

export function has_full_endorsement (members : MemberData[]) {
  return members.every(e => typeof e.sig === 'string')
}

export function get_signatures (members : MemberData[]) {
  return members.map(mship => {
    assert.exists(mship.sig)
    return mship.sig
  })
}
