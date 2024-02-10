import { DraftSession } from '@/client/class/draft.js'
import { MemberData }   from '@/types/index.js'

function has_member_api (draft : DraftSession) {
  return (pubkey : string) => {
    const mship = draft.members.find(e => e.pub === pubkey)
    return mship !== undefined
  }
}

function get_member_api (draft : DraftSession) {
  return (pubkey : string) => {
    const mship = draft.members.find(e => e.pub === pubkey)
    if (mship === undefined) {
      throw new Error('membership does not exist: ' + pubkey)
    }
    return mship
  }
}

function add_member_api (draft : DraftSession) {
  return (mship : MemberData) => {
    const curr = draft.members.find(e => e.pub === mship.pub)
    if (curr !== undefined) return
    const members = [ ...draft.members, mship ]
    return draft._store.patch({ members })
  }
}

function rem_member_api (draft : DraftSession) {
  return (pubkey : string) => {
    const members = draft.members.filter(e => e.pub !== pubkey)
    return draft._store.post({ ...draft.data, members })
  }
}

export default function (draft : DraftSession) {
  return { 
    has : has_member_api(draft),
    get : get_member_api(draft),
    add : add_member_api(draft),
    rem : rem_member_api(draft),
  }
}
