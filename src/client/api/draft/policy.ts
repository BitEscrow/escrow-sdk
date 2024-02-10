import { DraftSession }        from '@/client/class/draft.js'
import { tabulate_enrollment } from '@/lib/policy.js'
import { RolePolicy }          from '@/types/index.js'

function has_policy_api (draft : DraftSession) {
  return (pol_id : string) => {
    const pol = draft.roles.find(e => e.id === pol_id)
    return pol !== undefined
  }
}

function get_policy_api (draft : DraftSession) {
  return (pol_id : string) => {
    const pol = draft.roles.find(e => e.id === pol_id)
    if (pol === undefined) {
      throw new Error('policy does not exist: ' + pol_id)
    }
    return pol
  }
}

function add_policy_api (draft : DraftSession) {
  return (policy : RolePolicy) => {
    const pol = draft.roles.find(e => e.id === policy.id)
    if (pol !== undefined) return
    const roles = [ ...draft.roles, policy ]
    return draft._store.patch({ roles })
  }
}

function rem_policy_api (draft : DraftSession) {
  return (pol_id : string) => {
    const roles = draft.roles.filter(e => e.id !== pol_id)
    return draft._store.post({ ...draft.data, roles })
  }
}

function open_slots_api (draft : DraftSession) {
  return () => {
    const pols = []
    const tabs = tabulate_enrollment(draft.members, draft.roles)
    for (const [ id, tab ] of tabs) {
      const pol = draft.roles.find(e => e.id === id)
      if (pol === undefined) continue
      if (tab < pol.max_slots) pols.push(pol)
    }
    return pols
  }
}

function full_slots_api (draft : DraftSession) {
  return () => {
    const pols = []
    const tabs = tabulate_enrollment(draft.members, draft.roles)
    for (const [ id, tab ] of tabs) {
      const pol = draft.roles.find(e => e.id === id)
      if (pol === undefined) continue
      if (tab === pol.max_slots) pols.push(pol)
    }
    return pols
  }
}

export default function (draft : DraftSession) {
  return { 
    has : has_policy_api(draft),
    get : get_policy_api(draft),
    add : add_policy_api(draft),
    rem : rem_policy_api(draft),
    list_open : open_slots_api(draft),
    list_full : full_slots_api(draft)
  }
}
