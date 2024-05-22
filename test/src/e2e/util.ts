import { ProposalData }    from '@scrow/sdk/core'
import { create_proposal } from '@scrow/sdk/core/lib'
import { CoreSigner }      from '../types.js'

const NETWORK = 'regtest'

export async function get_proposal (
  members : CoreSigner[]
) : Promise<ProposalData> {
  const [ alice, bob, carol ] = members
  return create_proposal({
    title    : 'Basic two-party contract with third-party dispute resolution.',
    duration : 14400,
    network  : NETWORK,
    paths : [
      [ 'payout', 90000, await bob.core.new_address   ],
      [ 'return', 90000, await alice.core.new_address ]
    ],
    payments : [
      [ 10000,  await bob.core.new_address ]
    ],
    programs : [
      [ 'endorse', 'dispute',       'payout', 1, alice.signer.pubkey ],
      [ 'endorse', 'resolve',       '*',      1, carol.signer.pubkey ],
      [ 'endorse', 'close|resolve', '*',      2, alice.signer.pubkey, bob.signer.pubkey ]
    ],
    schedule: [
      [ 7200, 'close', 'payout|return' ]
    ],
    value   : 100000,
    version : 1
  })
}
