import { Buff }         from '@cmdcode/buff'
import { parse_extkey } from '@cmdcode/crypto-tools/hd'
import { SignerAPI }    from '@/core/types/index.js'
import { assert }       from '@/core/util/index.js'

import {
  MemberEntry,
  DraftSession
} from '../types.js'

export function create_credential (
  signer : SignerAPI,
  xpub   : string
) {
  const hid   = Buff.b58chk(xpub).digest
  const child = signer.get_id(hid)
  const pub   = child.pubkey
  return Buff.join([ pub, hid ]).hex + xpub
}

export function parse_credential (credstr : string) {
  const khex  = credstr.slice(0, 128)
  const xpub  = credstr.slice(128)
  const bytes = Buff.hex(khex)
  const pub   = bytes.subarray(0, 32).hex
  const hid   = bytes.subarray(32, 64).hex
  return { hid, pub, xpub }
}

export function claim_credential (
  entries : MemberEntry[],
  signer  : SignerAPI
) : MemberEntry | null {
  for (const mship of entries) {
    const { hid, pub } = parse_credential(mship[0])
    if (signer.has_id(hid, pub)) {
      return mship
    }
  }
  return null
}

export function update_credential (
  members : MemberEntry[],
  mship   : MemberEntry
) {
  const { pub } = parse_credential(mship[0])
  const idx = members.findIndex(e => e[0].startsWith(pub))
  const ret = [ ...members ]
  if (idx === -1) {
    ret.push(mship)
  } else {
    ret[idx] = mship
  }
  return ret
}

export function get_credential (
  mship   : string,
  session : DraftSession
) : MemberEntry {
  const pubkey = mship.slice(0, 64)
  const entry  = session.members.find(e => e[0].startsWith(pubkey))
  assert.ok(entry !== undefined, 'member entry does not exist')
  return entry
}

export function has_credential (
  mship   : string,
  session : DraftSession
) {
  const pubkey = mship.slice(0, 64)
  const exists = session.members.find(e => e[0].startsWith(pubkey))
  return exists !== undefined
}

export function has_signatures (members : MemberEntry[]) {
  return members.every(e => typeof e[2] === 'string')
}

export function get_signatures (members : MemberEntry[]) {
  return members.map(e => {
    const [ cred, _, sig ] = e
    assert.exists(sig)
    const { hid, pub, xpub } = parse_credential(cred)
    const { index } = parse_extkey(xpub)
    const idx = Buff.num(index, 4)
    return Buff.join([ pub, hid, sig, idx ]).hex
  })
}
