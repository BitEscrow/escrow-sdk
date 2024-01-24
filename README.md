[![Integration Tests](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml/badge.svg?branch=master)](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml)

# escrow-core

A light-weight, non-custodial protocol for using Bitcoin in a `covenant-based` smart contract.

Features:
  * Method libraries for every part of the protocol.
  * Multi-platform client with minimal dependencies.
  * Run-time schema validation (using zod).
  * E2E test suite for regtest, signet, and testnet.

Comimg Soon:
  * Return receipts on witness submission.
  * Improved code comments and documentation.
  * new `templates` field for raw tx templates.
  * `hashlock` and `oracle` programs for vm.
  * OpenAPI spec document.

## Overview

The protocol involves three parties:

```md
**Members** : The participating members of the contract.  
**Funders** : Those depositing funds into the contract (may be members).  
**Agent**   : The server agent hosting the escrow contract (BitEscrow API).
```

The protocol is split into three phases: `negotiation`, `funding`, and `settlement`. Each phase represents a round of communication in the protocol.

### Negotiation

The `members` of the contract must first negotiate and agree on a `proposal` document. This is a human-readable document which contains all of the terms of the contract. It is written and consumed in JSON format, and designed for collaboration (much like a PSBT).

```ts
{
  title    : 'Basic two-party contract with third-party dispute resolution.',
  content  : '{}',
  expires  : 14400,
  network  : 'regtest',
  paths: [
    [ 'payout', 90000, 'bcrt1qhlm6uva0q2m5dq4kjd9uzsankkxe9pza5uylcs' ],
    [ 'return', 90000, 'bcrt1qemwtdfh9uncvw7jlq4ux7p7stl9lgvfxa8t05g' ]
  ],
  payments : [[ 10000, 'bcrt1qxemag7t72rlrhl2ezsnsprmunmnzc35nmaph6v' ]],
  programs : [
    [ 'endorse', 'dispute', 'payout', 1, '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be' ],
    [ 'endorse', 'resolve',      '*', 1, '9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e' ],
    [ 'endorse', 'close|resolve','*', 2, 
      '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be',
      '4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10'
    ]
  ],
  schedule : [[ 7200, 'close', 'payout|return' ]],
  value    : 100000,
  version  : 1
}
```

If desired, a third-party can host the proposal. The protocol is designed for third-parties to help with negotiation, and offer their own services such as arbitration.

There is no specification placed on how to communicate the proposal between parties. There are so many great communication protocols that exist in the wild, and they virtually all support JSON, so feel free to use your favorite one!

> Note: The server `agent` does not take part in negotiations or arbitrate disputes. This is strictly by design. While BitEscrow may offer these services, the protocol is designed so that members and third-parties can negotiate freely, without the agent being involved.

### Funding

Once a final proposal has been delivered to our server, all terms and endorsements are validated, then a `contract` is formed. The contract is assigned a signing `agent`, which is used to coordinate deposits.

Each funder requests a deposit `account` from the agent. This account uses a 2-of-2 multi-signature address with a time-locked refund path.

```ts
interface DepositAccount {
  created_at : number  // UTC timestamp.
  address    : string  // <-- deposit funds here. 
  agent_id   : string  // ID of the agent.
  agent_pk   : string  // Pubkey of the agent  (in 2-of-2).
  member_pk  : string  // Pubkey of the funder (in 2-of-2).
  req_id     : string  // Hash digest of this record.
  sequence   : number  // Sequence value used for locktime.
  sig        : string  // Provided by server for authenticity.
}
```

The funder then delivers a batch of pre-signed transactions (called a `covenant`), which authorizes each of the spending paths of the contract.

```ts
interface CovenantData {
  cid    : string  // id of the contract.
  pnonce : string  // public nonce (used for musig).
  psigs  : [
    path : string, // name of path in the contract.
    psig : string  // partial signature (used for musig).
  ][]
}
```

Once the covenant is made, the funds are locked in escrow. Once all the required funds have bee locked and confirmed, the contract becomes active.

### Settlement

The final round of the escrow protocol is the `settlement`. This is the most exciting round, as members of the contract get to debate over how the money shall be spent.

When the contract becomes active, a virtual machine is started within the contract. This vm includes the `paths`, `programs`, and `tasks` specified in the proposal.

```ts
{
  commits: [],
  error  : null,
  head   : '21b8d90a9d5d249518f3b18a7d206a9f93a9745531f6e54a8813938f7fad42af',
  output : null,
  paths  : [ [ 'heads', 0 ], [ 'draw', 0 ], [ 'tails', 0 ] ],
  programs: [
    [
      'ac5c38273690b4c5d970b7075fcb65c59a19418884eca43e888fad969e122954',
      'endorse',
      'close',
      'heads|tails',
      2,
      '08a053368720d0c9d91cb2ff2ba574fe41430bf29fd6bf2e84362354e26dde99',
      '48ac68e8df9add2805d4e5379c12325bc518ec0c9592058b8636ebe28ce8c604'
    ],
    [
      '0b4eb344d2824e1f0c0df2a16f312437528a49675844d7827df26b35d0da08ea',
      'endorse',
      'dispute',
      'heads|tails',
      1,
      '08a053368720d0c9d91cb2ff2ba574fe41430bf29fd6bf2e84362354e26dde99',
      '48ac68e8df9add2805d4e5379c12325bc518ec0c9592058b8636ebe28ce8c604'
    ],
    [
      '65c1d6527d20713e7c16c6d4462a0885bf1a678e294426a6a20385227d81fdee',
      'endorse',
      'resolve',
      'heads|tails',
      1,
      '36e7977d0323bbf0aeed50c8f5823c80125c7d77c742bd9a62da98e30193f1b2'
    ]
  ],
  start: 1705815394,
  steps: 0,
  store: [
    [ 'ac5c38273690b4c5d970b7075fcb65c59a19418884eca43e888fad969e122954', '[]' ],
    [ '0b4eb344d2824e1f0c0df2a16f312437528a49675844d7827df26b35d0da08ea', '[]' ],
    [ '65c1d6527d20713e7c16c6d4462a0885bf1a678e294426a6a20385227d81fdee', '[]' ]
  ],
  status: 'init',
  tasks: [ [ 7200, 'close', 'draw' ] ],
  updated: 1705815394
}
```

Members of the contract can interact with the vm using signed statements, called a witness:

```ts
{
  action  : 'close',
  args    : [],
  method  : 'endorse',
  path    : 'tails',
  prog_id : 'ac5c38273690b4c5d970b7075fcb65c59a19418884eca43e888fad969e122954',
  sigs    : [
    '08a053368720d0c9d91cb2ff2ba574fe41430bf29fd6bf2e84362354e26dde997bd992345fdd377d1622c659450b9ee1fd05da039a3bb6b55a3e32cf353150daa4c69c57a508d648e9119b39ae0c954f5fe2368b1770b52300d23deeaac298da',
    '48ac68e8df9add2805d4e5379c12325bc518ec0c9592058b8636ebe28ce8c604d6946b5707550ff0e058196c3506872e722a6f30a2d8095817d2418b1617626e807cb11de648375ad0f38b08da0b6580ceb549aa2fe7d9eb96d4728f19875fdc'
  ],
  stamp   : 1705815394,
  wid     : '46609fd312fb162b530d2dd562f9b946d73192c21df35e27f380bf96110efb02'
}
```

Members can use the vm to settle on a spending path, or lock, unlock, and dispute paths. Each statement that updates the vm is recorded into a hash-chain. The chain validates the full running history of the vm, from activation to settlement.

Once the contract vm has settled on a spending path, the agent will complete the relevant pre-signed transaction, and broadcast it, closing the contract.

The proposal, covenants, and vm combine to create a proof of validity. This proof covers how the contract should execute at any moment. There is zero ambiguity left to the `agent`.

Each contract settlement on mainnet will include a valid proof in order to keep our reputation intact.

### Protocol Flow

> **Scenario**: Sales agreement between a buyer (alice) and seller (bob) with third-party (carol) arbitration.

  * Alice and Bob prepare a proposal, and agree on terms / arbitration.
  * Alice submits the proposal to the agent and receives a contract.
  * Alice deposits her funds with the contract agent, along with a covenant.
  * Once the deposit is confirmed on-chain, the contract becomes active.
  
  **[ settle contract - happy path ]**
  * Alice receives her widget and forgets about Bob.
  * The contract schedule closes automatically on 'payout'.
  * Bob gets the funds, Alice can verify the CVM execution.

  **[ settle contract - so-so path ]**
  * Alice doesn't like her widget.
  * Alice and Bob both agree to sign the 'refund' path.
  * Alice gets a partial refund, Bob still keeps his fees.

  **[ dispute contract - unhappy path ]**
  * Alice didn't get the right widget, and disputes the payout.
  * Carol now has authority to settle the contract.
  * Carol decides on the 'refund' path.
  * Alice gets a partial refund, Bob still keeps his fees.

  **[ expired contract - ugly path ]**
  * Alice claims she didn't get a widget, and disputes the payout.
  * Carol is on a two-week cruise in the bahamas.
  * The proposal did not include any auto-settlement terms.
  * The contract expires, all deposits are released.

  **[ expired deposits - horrific path ]**
  * Everything above happens, except the last part.
  * The entire escrow platform goes down in flames.
  * The timelock on deposits eventually expire.
  * Alice can sweep back her funds using the refund path.

### Security Model

A brief description of the security model:

  * Each member joins the proposal using an anonymous credential. The involvement of a credential can be independently verified without revealing the owner.
  
  * Members decide the terms of the proposal, and all spending paths. The contract agent does not get involved until the proposal terms have already been finalized.

  * Each member can optionally sign the proposal terms, if they wish to publicize their endorsement. This does not reveal their credential in the proposal.

  * Funders ultimately decide on what transactions to sign and deliver to the agent. If there's a disagreement, funders can back out of a deposit.

  * The contract agent cannot link depositors to members, nor members to credentials.

  * The contract agent can only settle on transactions   provided by funders.
  
  * All parites independently verify the progression of the contract, and the final settlement. If the platform settles without a valid proof, their reputation is burned.

Some challenges with the current model:

  * The platform has a limited opportunity to censor members of a contract by ignoring their witness statements. In the short term, we plan to mitigate this using signed delivery receipts. In the long-term, we will support alternative platforms for delivery (such as nostr).

  * Even with the covenant restrictions, the burning of reputation may not be considered strong enough incentive. We are exploring additional options, such as staking collateral.

In terms of security, speed, and simplicity, we believe this is the best non-custodial solution for providing programmable escrow contracts on Bitcoin.

## How to Use

This readme will be an mixture of documentation and links to code examples. The full documentation is still a work in progress.

The two main resources for example code are here:

  [test/client](test/client) - : Example usage of the full BitEscrow API.  
  [test/demo](test/demo) ----- : Step-by-step example of the protocol.  

### Protocol Demo

Below is a step-by-step guide through the protocol using code examples.

 1. [Create a Client](test/demo/01_create_client.ts)
 2. [Create a Signer](test/demo/02_create_signer.ts)
 3. [Build a Proposal](test/demo/02_create_proposal.ts)
 4. [Roles and Endorsment](test/demo/02_roles_and_endorse.ts)
 5. [Create a Contract](test/demo/02_create_contract.ts)
 6. [Request a Deposit Accout](test/demo/02_request_account.ts)
 7. [Deposit funds into a Contract](test/demo/02_deposit_funds.ts)
 8. [Monitor a Contract](test/demo/02_check_contract.ts)
 9. [Settle a Contract](test/demo/02_settle_contract.ts)

 > Click on a section to view the example code.

### API Demo

Documentation coming soon!

## Development / Testing

This project uses the following scripts:

```md
  build         : Compiles the contents of `src` folder to `dist`. 
  demo <chain>  : Runs the protocol demo for the provided chain.
  load <script> : Executes the script at the provided path.
  release       : Builds and tests the current source for release.
  scratch       : Executes the `test/scratch.ts` file.
  test          : Runs the current test suite in `test/tape.ts`.
```

Example of running the demo on the mutiny chain (using npm):

```bash
npm run demo mutiny
```

> The available chains are mutiny, signet, and testnet. Main chain coming soon!

Example of running the current test suite in verbose mode:

```bash
VERBOSE=true npm run test
```

Please stay tuned for more documentation and updates!

## Questions / Issues

Please feel free to post questions or comments on the issue board. All feedback is welcome.

## Contribution

Help wanted. All contributions are welcome!

## Resources

Nearly the entire code-base has been built from scratch, with only one hard third-party dependency and a couple soft dependencies.

**noble-curves**  

Best damn elliptic curve library. Lightweight, independently audited, optimized to hell and back. Works across all platforms. Even deals with the nightmare that is webcrypo. There is no second best. Credit to Paul Miller.

https://github.com/paulmillr/noble-curves  

**noble-hashes**  

Paul's hashing library is also great, and performs synchronous operations. Credit to Paul Miller.

https://github.com/paulmillr/noble-hashes  

**zod**  

The best run-time validation library, also the best API of any method library. Turns javascript into a some-what respectable language. The error output can be the stuff of nightmares though. Credit to Colin McDonnel.

https://github.com/colinhacks/zod  

**tapscript**  

My humble taproot library and grab-bag of bitcoin related tools. Currently using a development version that has yet-to-be released due to undocumented changes in the API. 

https://github.com/cmdruid/tapscript  

**musig2**  

Reference implementation of the Musig2 protocol with a few additional features. However I do not implement the death star optimization.

https://github.com/cmdruid/musig2  

**crypto tools**  

Provides a full suite of cryptographic primities and other useful tools. Wraps the noble-curve and noble-hash libraries (and cross-checks them with other implementations). Also provides an extended protocol for BIP32 key-derivation that supports strings and urls.

https://github.com/cmdruid/crypto-tools  

**buff**  

The swiss-army-knife of byte manipulation. Such a fantastic and invaluable tool. Never leave home without it.

https://github.com/cmdruid/buff  

**core command**  

Not a run-time dependency, but I use this to incorporate bitcoin core directly into my test suite. I also use it to mock-up core as a poor-man's electrum server. Acts as a daemon wrapper and CLI tool, provides a full wallet API, faucets, and can run bitcoin core natively within a nodejs environment (which is pretty wild).

https://github.com/cmdruid/core-cmd  

**signer**  

Reference implementation of the new hybrid signing device / wallet we are building for BitEscrow. The documentation needs to be updated. WIP.

https://github.com/cmdruid/signer  

# Footnote

My inspiration for this project comes from the Bitcoin space, and the incredibly talented people that contribute. I will be forever grateful for their knowledge, kindness and spirit.

I wish for Bitcoin to win all the marbles; and be the new global reserve marbles that we fight over. I firmly believe a better money system will make the world a better place. Maybe we will reach beyond the moon.
