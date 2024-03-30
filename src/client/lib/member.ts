// import { Buff, Bytes } from '@cmdcode/buff'
// import { verify_sig }  from '@cmdcode/crypto-tools/signer'

// import {
//   CredentialAPI,
//   MemberData,
//   WalletAPI
// } from '../types.js'

// /**
//  * Create a new membership using a parent
//  * signing device and wallet.
//  */
// export function gen_membership (
//   index  : number,
//   signer : CredentialAPI,
//   wallet : WalletAPI
// ) : MemberData {
//   return signer.gen_cred(index, wallet.xpub)
// }

// export function has_membership (
//   members : MemberData[],
//   signer  : CredentialAPI
// ) {
//   const entry = members.find(e => signer.has_id(e.id, e.pub))
//   return entry !== undefined
// }

// export function get_membership (
//   members : MemberData[],
//   signer  : CredentialAPI
// ) {
//   const entry = members.find(e => signer.has_id(e.id, e.pub))

//   if (entry === undefined) {
//     throw new Error('signer is not a member')
//   }

//   return entry
// }

// export function has_credential (
//   cred   : MemberData,
//   signer : CredentialAPI
// ) {
//   return signer.has_id(cred.id, cred.pub)
// }

// export function has_member_data (
//   members : MemberData[],
//   mship   : MemberData
// ) {
//   return members.find(e => e.pub === mship.pub) !== undefined
// }

// /**
//  * Add a membership entry to the members list.
//  */
// export function add_member_data (
//   members : MemberData[],
//   mship   : MemberData
// ) {
//   if (members.some(e => e.pub === mship.pub)) {
//     throw new Error('member data already exists')
//   }
//   return [ ...members, mship ]
// }

// export function upsert_member_data (
//   members : MemberData[],
//   mship   : MemberData
// ) {
//   const mbrs = members.filter(e => e.pub !== mship.pub)
//   return [ ...mbrs, mship ]
// }

// /**
//  * Remove a membership entry from the members list.
//  */
// export function rem_member_data (
//   members : MemberData[],
//   mship   : MemberData
// ) {
//   return members.filter(e => e.pub !== mship.pub)
// }

// export function create_endorsement (
//   record_id : Bytes,
//   signer    : CredentialAPI
// ) {
//   const pub = signer.pubkey
//   const sig = signer.sign(record_id)
//   return Buff.join([ pub, sig ])
// }

// export function verify_endorsement (
//   record_id : Bytes,
//   signature : Bytes,
//   throws = false
// ) {
//   const bytes = Buff.bytes(signature)
//   const pub   = bytes.subarray(0, 32)
//   const sig   = bytes.subarray(32, 96)
//   const bool  = verify_sig(sig, record_id, pub)
//   if (!bool && throws) {
//     throw new Error('invalid signature for pubkey: ' + pub.hex)
//   }
//   return bool
// }
