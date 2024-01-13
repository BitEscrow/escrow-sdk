import {
  MemberData,
  SignerAPI,
  WalletAPI
} from '@/types/index.js'

/**
 * Create a new membership using a parent
 * signing device and wallet.
 */
export function gen_membership (
  index  : number,
  signer : SignerAPI,
  wallet : WalletAPI,
) : MemberData {
  return signer.gen_cred(index, wallet.xpub)
}

export function has_membership (
  members : MemberData[],
  signer  : SignerAPI
) {
  const entry = members.find(e => signer.has_id(e.id, e.pub))
  return entry !== undefined
}

export function get_membership (
  members : MemberData[],
  signer  : SignerAPI
) {
  const entry = members.find(e => signer.has_id(e.id, e.pub))

  if (entry === undefined) {
    throw new Error('signer is not a member')
  }

  return entry
}

export function has_member_data (
  members : MemberData[],
  mship   : MemberData,
) {
  return members.find(e => e.pub === mship.pub) !== undefined
}

/**
 * Add a membership entry to the members list.
 */
export function add_member_data (
  members : MemberData[],
  mship   : MemberData,
) {
  if (members.some(e => e.pub === mship.pub)) {
    throw new Error('member data already exists')
  }

  return [ ...members, mship ]
}

export function update_member_data (
  members : MemberData[],
  mship   : MemberData,
) {
  const mbrs = members.filter(e => e.pub === mship.pub)
  return [ ...mbrs, mship ]
}

/**
 * Remove a membership entry from the members list.
 */
export function rem_member_data (
  members : MemberData[],
  mship   : MemberData
) {
  return members.filter(e => e.pub !== mship.pub)
}
