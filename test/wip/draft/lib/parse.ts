import DraftSchema from '../../../schema/draft.js'
import PropSchema  from '@/core/schema/proposal.js'

export function parse_mship (mship : string) {
  const json = JSON.parse(mship)
  return DraftSchema.membership.parse(json)
}

export function parse_terms (terms : string) {
  const json = JSON.parse(terms)
  return PropSchema.data.partial().parse(json)
}
