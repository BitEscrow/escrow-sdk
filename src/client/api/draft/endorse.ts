import { DraftSession }       from '@/client/class/draft.js'
import { verify_endorsement } from '@/lib/member.js'
import { get_proposal_id }    from '@/lib/proposal.js'

function endorse_exists_api (draft : DraftSession) {
  return () => {
    return draft.signatures.some(e => {
      const pub = e.slice(0, 64)
      return pub === draft.signer.pubkey
    })
  }
}

function endorse_create_api (draft : DraftSession) {
  return () => {
    const signer   = draft.signer
    const endorsed = signer.draft.endorse(draft.data)
    return draft._store.post(endorsed)
  }
}

function endorse_verify_api (draft : DraftSession) {
  return () => {
    return draft.signatures.every(e => {
      const pid = get_proposal_id(draft.proposal)
      return verify_endorsement(pid, e)
    })
  }
}

export default function (draft : DraftSession) {
  return {
    exists : endorse_exists_api(draft),
    sign   : endorse_create_api(draft),
    verify : endorse_verify_api(draft)
  }
}
