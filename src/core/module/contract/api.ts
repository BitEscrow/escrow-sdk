import {
  ContractRequest,
  ProposalData
} from '../../types/index.js'

import ContractSchema from '../../schema/contract.js'

export function create_publish_req (
  proposal      : ProposalData,
  endorsements ?: string[]
) : ContractRequest {
  return ContractSchema.publish_req.parse({ endorsements, proposal })
}
