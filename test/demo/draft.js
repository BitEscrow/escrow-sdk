import { Lib }     from 'https://unpkg.com/@scrow/core@latest/dist/module.mjs'
import { config }  from '../config.js'
import { signers } from './signer.js'

export function get_draft () {

  const [ a_signer, b_signer, c_signer ] = signers

  let session = Lib.proposal.create_draft({
    proposal : { ...config.terms, moderator : c_signer.pubkey },
    roles    : config.roles
  })

  const [ buyer, seller, agent ] = session.roles

  // For each member, add their info to the proposal.
  session = a_signer.draft.join(buyer, session)
  session = b_signer.draft.join(seller, session)
  session = c_signer.draft.join(agent, session)

  // For each member, collect an endorsement signature.
  signers.map(mbr => {
    const sig = mbr.draft.endorse(session)
    session.signatures.push(sig)
  })

  return session
}
