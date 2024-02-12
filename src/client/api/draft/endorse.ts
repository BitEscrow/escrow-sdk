import { Buff }               from '@cmdcode/buff'
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

function endorse_draft_api (draft : DraftSession) {

  return () => {
    const signer    = draft.signer
    const signature = signer.draft.endorse(draft.data)
    const commit_id = Buff.str(signature).digest.hex
    const receipt   = draft._store.on_commit(commit_id)
    draft._socket.send('endorse', signature)
    return receipt
  }
}

export default function (draft : DraftSession) {
  return {
    exists : endorse_exists_api(draft),
    sign   : endorse_draft_api(draft)
  }
}
