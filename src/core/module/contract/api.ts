import {
  ContractPublishRequest,
  ProposalData
} from '../../types/index.js'

import ContractSchema from '../../schema/contract.js'

export function create_publish_req (
  proposal      : ProposalData,
  endorsements ?: string[]
) : ContractPublishRequest {
  return ContractSchema.publish_req.parse({ endorsements, proposal })
}
