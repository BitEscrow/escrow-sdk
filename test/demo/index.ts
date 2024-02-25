import {
  DraftData,
  EscrowClient,
  EscrowSigner,
  ProposalData,
  ProposalTemplate,
  RoleTemplate
} from '@/index.js'

import servers from './servers.json' assert { type : 'json' }

import { create_draft } from '@/lib/proposal.js'
import { Logger } from './utils.js'

import { create_contract_api } from './publish.js'

export default function (
  aliases    : string[],
  proposal   : ProposalTemplate,
  roles      : RoleTemplate[]
) {
  const logger  = new Logger()
  const network = proposal.network ?? 'mutiny'
  const { faucet, hostname, oracle } = servers[network]
  const config      = { hostname, network, oracle }
  const client      = new EscrowClient(config)
  const signers     = aliases.map(e => EscrowSigner.import(config).from_phrase(e))
  const new_draft   = create_draft({ proposal, roles })
  const final_draft = finalize_draft(new_draft, signers)

  return {
    new_contract     : create_contract_api(logger),
    new_account      : '',
    open_deposit     : '',
    locked_deposit   : '',
    active_contract  : '',
    witness_data     : '',
    settled_contract : ''
  }
}

function finalize_draft (
  draft   : DraftData,
  signers : EscrowSigner[]
) {
  draft.roles.forEach((role, idx) => {
    draft = signers[idx].draft.join(role, draft)
  })
  signers.forEach((signer) => {
    const sig = signer.draft.approve(draft)
    draft.approvals.push(sig)
  })
  return draft
}