import { verify_proposal } from '@/core/validation/proposal.js'

import { EscrowSigner } from '../../class/signer.js'
import { CredentialConfig, DraftSession } from '../../types.js'

import {
  claim_membership,
  create_credential
} from '../../lib/membership.js'

import {
  endorse_session,
  join_session,
  leave_session
} from '../../lib/session.js'

export function join_session_api (esigner : EscrowSigner) {
  return (
    pol_id  : string,
    session : DraftSession,
    options : CredentialConfig = {}
  ) : DraftSession => {
    const { hid, idx } = options
    const signer = (hid !== undefined)
      ? esigner._signer.get_id(hid)
      : esigner._signer
    const xpub  = (idx !== undefined)
      ? esigner._wallet.get_account(idx).xpub
      : esigner._wallet.xpub
    const cred  = create_credential(signer, xpub)
    return join_session(cred, pol_id, session)
  }
}

export function leave_session_api (esigner : EscrowSigner) {
  return (session : DraftSession) : DraftSession => {
    const mship = claim_membership(session.members, esigner._signer)
    if (mship === null) return session
    return leave_session(mship, session)
  }
}

export function endorse_session_api (esigner : EscrowSigner) {
  return (session : DraftSession) : DraftSession => {
    const { machine, server_pol } = esigner
    verify_proposal(machine, server_pol, session.proposal)
    // also need to verify mship and role.
    return endorse_session(session, esigner._signer)
  }
}

export function has_membership_api (esigner : EscrowSigner) {
  return (session : DraftSession) : boolean => {
    const mship = claim_membership(session.members, esigner._signer)
    return mship !== null
  }
}

export default function (esigner : EscrowSigner) {
  return {
    endorse : endorse_session_api(esigner),
    is_mbr  : has_membership_api(esigner),
    join    : join_session_api(esigner),
    leave   : leave_session_api(esigner)
  }
}
