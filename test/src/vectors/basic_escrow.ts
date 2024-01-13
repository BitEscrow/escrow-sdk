import { ProposalData } from '@scrow/core'
import { EscrowMember } from '../types.js'

const NETWORK  = 'regtest'

export async function get_proposal (
  members : EscrowMember[]
) : Promise<ProposalData> {
  const [ alice, bob, carol ] = members
  return {
    title    : 'Basic two-party contract with third-party dispute resolution.',
    content  : 'n/a',
    expires  : 14400,
    members  : [],
    network  : NETWORK,
    paths    : [
      [ 'payout', 90000, await bob.wallet.new_address   ],
      [ 'return', 90000, await alice.wallet.new_address ]
    ],
    payments : [
      [ 10000,  await bob.wallet.new_address ]
    ],
    programs : [
      [ 'sign', 'dispute',       'payout', 1, alice.signer.pubkey ],
      [ 'sign', 'resolve',       '*',      1, carol.signer.pubkey ],
      [ 'sign', 'close|resolve', '*',      2, alice.signer.pubkey, bob.signer.pubkey ]
    ],
    schedule: [
      [ 7200, 'close', 'payout|return' ]
    ],
    value   : 100000,
    version : 1
  }
}
