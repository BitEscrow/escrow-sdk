import { verify_proposal } from '@/core/validation/proposal.js'

import { EscrowSigner } from '../../class/signer.js'
import { DraftSession } from '../../types.js'

import {
  claim_credential,
  create_credential
} from '../../lib/credential.js'

import {
  endorse_session,
  join_session,
  leave_session
} from '../../lib/session.js'

export function join_session_api (esigner : EscrowSigner) {
  return (
    pol_id  : string,
    session : DraftSession,
    idx    ?: number
  ) : DraftSession => {
    const stamp = idx ?? session.proposal.created_at
    const cxpub = esigner._wallet.get_account(stamp).xpub
    const mship = create_credential(esigner._signer, cxpub)
    return join_session(mship, pol_id, session)
  }
}

export function leave_session_api (esigner : EscrowSigner) {
  return (session : DraftSession) : DraftSession => {
    const mship = claim_credential(session.members, esigner._signer)
    if (mship === null) return session
    return leave_session(mship[0], session)
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
    const mship = claim_credential(session.members, esigner._signer)
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
