import { SignerAPI } from '@/core/types/index.js'
import { assert }    from '@/util/index.js'

import {
  CredentialData,
  DraftSession,
  MemberData
} from '@/client/types/index.js'

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
  mship   : Partial<MemberData>
) {
  const idx = members.findIndex(e => e.pub === mship.pub)
  if (idx === -1) {
    throw new Error('member does not exist')
  }
  members[idx] = { ...members[idx], ...mship }
  return [ ...members ]
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

export function has_endorsements (
  members    : MemberData[],
  signatures : string[]
) {
  const pubkeys = signatures.map(e => e.slice(0, 64))
  return members.every(e => pubkeys.includes(e.pub))
}
