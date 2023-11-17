[![Integration Tests](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml/badge.svg?branch=master)](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml)

# escrow-core

Core library for implenting the escrow protocol.

Features:
  * Method libraries for the proposal, contract, and settlement rounds of the protocol.
  * Multi-platform client with minimal dependencies.
  * Run-time schema validation (using zod).
  * Showcases the power of taproot and musig2.
  * E2E test suite with native Bitcoin Core integration.

Comimg Soon:
  * Caching and hydration for the contract object.
  * Real-time events with EventEmitter interface.
  * Tooling for disposable private keys.
  * More tests and documentation.

Long Term:
  * Spending paths with variable amounts.
  * Extended deposit key for generating addresses.
  * Direct change outputs into a new deposit.
  * Refinements to the contract vm.

## Prelude

The focus of this project is to build the best escrow platform on the planet, using Bitcoin as a form of programmable collateral, and its block-chain as a global arbitration service.

This open-source project represents my one-year tribute of chasing after that dream.

My inspiration comes from the Bitcoin space, and the incredibly talented people that keep it alive. From them I gained my knowledge and spirit, and for that I am grateful.

I wish for Bitcoin to win all the marbles; and become the new global reserve marbles that we all fight over. I firmly believe it will make the world a better place, and bring society towards a golden age. Maybe we will become space-faring apes that reach beyond the moon.

> Bitcoin simply must be for enemies, or it will never be for friends.  
> -- Mark Goodwin, [01/24/2022](https://bitcoinmagazine.com/culture/bitcoin-maximalism-and-bitcoin-adoption)

## Mission Statement

- Make escrow cheaper, faster, and better.
- Make bitcoin programmable again.
- Developers. Developers. Developers.

Core design principles for the protocol:

```md
Short and sweet.      - as few rounds of communication as possible.
Remain discreet.      - no leaking of any sensitive information.
Custody is cancer.    - we are strictly a non-custodial escrow protocol.
Keys are radioactive. - bad practices can expose private keys (which give us cancer).
```

## Overview

The protocol is split into three phases: `proposal`, `funding`, and `settlement`. Each phase represents a round of communication in the protocol.

**Proposal**:  

A proposal is the pre-cursor to a contract, and contains all of the negotiable terms. It is written and consumed in JSON format, and designed for collaboration (much like a PSBT).

There is no specification placed on how to communicate a proposal between parties. There are already many great communication protocols that exist in the wild, and they (mostly) support JSON. Feel free to use your favorite one!

**Funding**:  

Once the terms of a proposal have been established, the next step is to setup an escrow contract. The contract requires a collaborative agreement between three acting parties:

  - The `members` of the proposal, which receive the funds.
  - The `funders` of the proposal, which deposit the money.
  - The escrow `agent`, which executes the terms of the contract.

In order to secure funds, each funder makes a `deposit` into a 2-of-2 multi-signature address with the agent, that includes a time-locked refund path to the funder. The time-lock ensures the agent has an exclusive window to negotiate spending, while the refund output guarantees the funder can recover their funds in a worst-case scenario.

Once funds are secured within a deposit address, a `covenant` is then made between the funder and agent. This covenant is constructed using a set of pre-signed transactions, with each transaction authorizing one of the spending paths of the contract.

Due to the multi-signature arrangement of funds, both the agent and funder must agree on the terms of the contract. 

> Note: In fact, due to the non-interactive nature of the protocol, both parties must come to a consensus in order to produce a valid signature. Part of the design intent for the proposal specification was to make this consensus robust enough that it could handle high-frequency trading.

Once the covenant is made, the funds are considered to be in escrow. When the agent has collected enough funds to cover the value of the contract, the contract then becomes active.

**Settlement**:

The final round of the escrow process is the `settlement`. This is the most fun part of the protocol, as members of the contract now get to debate about how the money shall be spent.

At this phase:

  * The agent is bound by the covenant, and can only settle the contract using a pre-authorized spending path.
  * The agent does have control over that selection process, and can implement any protocol.

To maximize the power of the first point, and minimize risk from the second point, both the `members` and `agent` interact with the contract through the use of a virtual machine. The consensus of this machine is governed by the terms of the proposal, which define:

  - The `paths` available to spend in the contract.
  - The `actions` that can be taken on a given path.
  - The `method` used to trigger those actions.
  - The `params` used to configure each method.

> Note: Each method involves the creation / validation of a crypto-graphic proof.

The sum of these definitions constitutes a `program` that can be executed.

To execute a program, a `member` submits their arguments to the `agent`, who then uses the machine to evaluate the arguments. If the arguments are valid, then the machine state is updated. The agent then creates a basic commit hash that records the changes that took place. This hash is signed and returned to the `member` as a form of receipt.

> Note: Each commit proof links to the previous, forming a git-style hash chain of attribution.

Once the machine has computed a result for the contract, the agent then proceeds to complete each covenant and broadcast the selected path via an on-chain transaction.

**Agents**  

A quick note about agents. From the protocol perspective, agents are meant to be like meeseeks: their purpose in the life of a contract is to collect signatures, crunch numbers, then spit out a transaction for a nominal fee. Any descision outside of a 0 or 1 equals pain for the agent.

The proposal is designed to outline a simple decision tree for the agent to follow, so that all decisions are verifiable. The agent is not designed to be an arbitrator, rather the arbitrator (if included) would be a member of the contract, and would interact with the agent under the same terms.

At a high level, we are combining the use of pre-signed covenants, with a protocol for establishing an end-to-end cryptographic contract between the three parties. The contract guarantees that the agent can't cheat without being caught, and the covenant guarantees the agent has no direct control over the funds.

Thankfully, all of this can done by open-source computer software. :-)

## Protocol Flow

> **Scenario**: Sales agreement between a buyer (alice) and seller (bob) with third-party (carol) arbitration.

Step 0 (draft proposal):  
  * Alice prepares a proposal with Bob. They both agree on Carol to resolve disputes.

Step 1 (create contract):  
  * Bob submits his proposal to the agent and receives a contract.
  * Bob shares this contract with Alice.

Step 2 (deposit & covenant):  
  * Alice deposits her funds into a 2-of 2 account with the contract agent.
  * Alice signs a covenant that spends her funds to either 'payout' or 'refund' path.
  * Once the deposit is confirmed on-chain, the contract becomes active.
  
Step 3a (settle contract - happy path):  
  * Alice receives her widget and forgets about Bob.
  * The contract schedule closes automatically on 'payout'.
  * Bob gets the funds, Alice can verify the CVM execution.

Step 3b (settle contract - so-so path):  
  * Alice doesn't like her widget.
  * Alice and Bob both agree to sign the 'refund' path.
  * Alice gets a partial refund, Bob still keeps his fees.

Step 3c (dispute contract - unhappy path):  
  * Alice claims she didn't get a widget, and disputes the payout.
  * Carol now has authority to settle the contract.
  * Carol decides on the 'refund' path.
  * Alice gets a partial refund, Bob still keeps his fees.

Step 3d (expired contract - ugly path):  
  * Alice claims she didn't get a widget, and disputes the payout.
  * Carol is on a two-week cruise in the bahamas.
  * The proposal did not include any auto-settlement terms.
  * The contract hangs in dispute until it expires.
  * The fallback path is executed, or if not defined, all deposits are refunded.

Step 3e (expired deposits - horrific path):  
  * Everything in 3d happens, except the last bit.
  * The entire escrow platform goes down in flames.
  * All deposits expire, and can be swept using the refund path.

## The Proposal

A proposal is the precursor to creating a contract. It defines the terms of the contract and how the CVM should be initialized. It is written in a simple JSON format that is easy to read, for humans and machines alike.

```ts
{
  title    : 'Basic two-party contract with third-party dispute resolution.',
  details  : 'n/a',
  expires  : 14400,
  network  : 'regtest',
  paths: [
    [ 'payout', 90000, 'bcrt1qhlm6uva0q2m5dq4kjd9uzsankkxe9pza5uylcs' ],
    [ 'return', 90000, 'bcrt1qemwtdfh9uncvw7jlq4ux7p7stl9lgvfxa8t05g' ]
  ],
  payments : [[ 10000, 'bcrt1qxemag7t72rlrhl2ezsnsprmunmnzc35nmaph6v' ]],
  programs : [
    [ 'dispute', 'payout', 'sign', 1, '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be' ],
    [ 'resolve',      '*', 'sign', 1, '9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e' ],
    [ 'close|resolve','*', 'sign', 2, 
      '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be',
      '4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10'
    ]
  ],
  schedule : [[ 7200, 'close', 'payout|return' ]],
  value    : 100000,
  version  : 1
}
```

The format is designed to be collaborative and shared between parties. Each member can add their own terms to the `paths`, `payments`, `programs`, and `schedule` fields. All other fields are require a unanimous consensus across members.

The following table defines a complete list of terms that may be included in the proposal. Fields marked with a `?` are optional.

| Term      | Description                                                                                                                                                       |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| confirmations? | Enforce a minimum number of confirmations on deposits before being accepted. Optional.
| details   | Detailed information about the contract.                                                                                                                          |
| deadline?  | The amount of time (in seconds) available for funding a once a contract is published. If the funding goal is not met by the deadline, the contract is cancelled. |
| effective? | The exact date (in UTC seconds) that a contract is scheduled to activate. If a deadline is not specified, then the effective date is used to imply a funding deadline.                             |
| expires   | The maximum time (in seconds) that a contract can exist once published. If a contract does not settle by the expiration date, then it is cancelled.                  |
| fallback?  | This specifies a default spending path to be used if and when a contract expires. Optional.
| feerate? | Enforce a minimum feerate on all deposits. Optional.                                                                       |
| network   | The blockchain that this contract is executing on. Defaults to bitcoin mainnet.                                                                                   |
| paths     | A collection of spending outputs, labeled with a path name.                                                                                                        |
| payments  | A collection of spending outputs that should be included in all spending paths. More details on paths and payments are described below.                             |
| programs  | A collection of programs that will be made available in the CVM, plus their configuration. More details on programs are described below.                           |
| schedule  | A collection of scheduled actions that will executed within the CVM. More details on the schedule are described below.                                            |
| title     | The title of the proposal.                                                                                                                                        |
| value     | The output value of the contract. Each set of spending outputs must sum to this total amount.                                                                     |
| version   | A version number for the proposal specification.                                                                                                                  |

### Paths and Payments

The purpose of `paths` and `payments` is to collectively define a set of spending outputs that will be pre-signed by depositors, and made available to the agent for settlement.

**Paths**  

A spending path represents a conditional payment. It may or may not be sent, depending how the contract is settled.

Each path entry must contain three items: the *label*, *output value*, and *destination address*.
```ts
[ 'payout', 90000, 'bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc' ]
```

**Payments**  

A payment is just that: an unconditional payment to an address. A payment must be included in _all_ spending paths.

Each payment entry must contain just two items: the *output value* and *destination address*.
```ts
[ 10000, 'bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc' ]
```

When a contract is created, the outputs specified in `paths` are grouped together by path-name, and each group is used to create a transaction template. The outputs specified in `payments` are then added to each template (along with `fees` from the agent). This creates the final set of transaction templates that each depositor must sign.

The total sum for each transaction template must be identical, and must equal the `value` of the proposal.

### Actions and Programs

Each contract comes with a tiny virtual machine, called the CVM. The purpose of the CVM is to provide contract members an environment for updating the contract and debating how it should be settled.

**Actions**  

Updates to the CVM take the form of an `action` that is applied to a specified `path`:

```
close   : Settle the contract using the provided path.
lock    : Lock a spending path from being used.
unlock  : Unlock a spending path for use.
dispute : Dispute a spending path and block its use.
resolve : Resolve a dispute and settle the contract.
```

Actions can be taken within the CVM by executing a program.

**Programs**  

Programs are loaded into the CVM using the `programs` section of the proposal. Each program specifies the following configuration:

  - The `action` policy, which defines the actions this program can take. 
  - The `path` policy, which restricts which paths this program can access. 
  - The `method` used to activate the program.
  - Additional `params` that configure the method.

> The regex format for actions and paths is intentionally limited: It accepts '|' for specifying multiple options, or a single '*' for specifying all options. No other patterns are allowed.

The following entry is an example definition of a program:

```ts
[ 'close|resolve', '*', 'sign', 2, buyer_pubkey, seller_pubkey ]
```

Let's assume that for our `sign` program, the list of pubkeys includes the buyer and seller. The buyer and seller can use the above program to `close` or `resolve` the contract on any (*) spending path. They can do this by using the `sign` method, which requires submitting a signed statement to the program. The program requires a minimum of two signatures to agree on a resolution, and must use a pubkey that is included in the list.

The `sign` method is a basic implementation of a threshold multi-signature agreement. Additional methods and actions will be added to the CVM in the future.

**Rules of Action**  

The logic rules for the CVM are designed to be simple and easy to follow:

```
  - An open path can be locked, disputed, or closed.
  - A locked path can be disputed or released.
  - A disputed path can only be resolved.
  - Closing a path will settle the contract.
  - Resolving a dispute will settle the contract.
```

Keeping the state of the virtual machine simple is a security feature. It prevents bugs and strange edge-cases from developing and risking the mis-direction of funds.

### Scheduled Actions

In addition to `programs`, an action can be executed within the CVM on a pre-defined schedule.

In the proposal, each task entry must contain three items: the *timer*, *action*, and *path regex*.
```ts
[ 7200, 'close', 'payout|return' ]
```

The timer is defined in seconds, and will be relative to the `activated` date that is defined in the contract. Once the specified number of seconds have passed, the action will be executed inside the CVM.

You may specify multiple paths. The task will execute the provided action on each path in sequential order. If the result of the action leads to a settlement, then the contract will close. If an action fails to execute on a given path (due to a rule violation), then the task will continue to the next path.

## The Contract

The contract serves as the main document between depositors and members. It provides information for making deposits, constructing a covenant, and hosting the CVM for members to interact with.

```ts
interface ContractData {
  activated   : null | number
  agent_id    : string
  agent_key   : string
  agent_pn    : string
  balance     : number
  cid         : string
  deadline    : number
  expires_at  : null | number
  fees        : Payment[]
  moderator   : string | null
  outputs     : SpendTemplate[]
  pending     : number
  prop_id     : string
  published   : number
  settled     : boolean
  settled_at  : number | null
  spent       : boolean,
  spent_at    : number | null
  spent_txid  : string | null
  status      : ContractStatus
  terms       : ProposalData
  total       : number
  updated_at  : number
  vm_state    : null | ContractState
}
```

```ts
// The different states of a Contract.
export type ContractStatus = 
  'published' | // Initial state of a contract. Can be cancelled. 
  'funded'    | // Contract is funded, not all deposits are confirmed.
  'secured'   | // All deposits are confirmed, awaiting delayed execution. 
  'pending'   | // Contract is ready for activation
  'active'    | // Contract is active, CVM running, clock is ticking.
  'closed'    | // Contract is closed, ready for settlement.
  'spent'     | // Contract is spent, tx in mempool.
  'settled'   | // Contract is settled, tx is confirmed.
  'canceled'  | // Contract canceled or expired during funding.
  'expired'   | // Contract expired during execution.
  'error'       // Something broke, may need manual intervention.
```

Once funds are secured and the contract is active, the CVM is initialized and ready to accept arguments.

```ts
// The state of a newly born CVM, fresh from the womb.
state: {
  commits : [],
  head    : 'df015d478a970033af061c7ed0152b97907c148b51353a8a33f79cf0b3d87350',
  paths   : [ [ 'payout', 0 ], [ 'return', 0 ] ],
  result  : null,
  start   : 1696362768,
  status  : 'init',
  steps   : 0,
  store   : [],
  updated : 1696362768
}
```

Arguments are supplied using signed statements. Each statement is fed into the CVM, and evaluated within the rules of the CVM. If the statement is valid, then the actions are applied, the state is updated, and a receipt is returned to the sender.

```ts
type WitnessEntry = [
  stamp   : number,   // A UTC timestamp, in seconds.
  prog_id : string,   // An identifier that calls the program.
  ...args : Literal[] // The arguments to supply to the program.
]
```

Currently, the CVM only supports one method, and that is the `sign` method. This method is designed to accept a number of signatures, then execute an action based on a quorum of signatures being reached. The threshold for this quorm is defined in the proposal terms.

The `sign` method uses compact signature proofs that are designed to be easy to work with. They are inspired by `NIP-26` delegation proofs, and can support an optional query string to provide additional parameters.

```ts
// Includes a reference id, pubkey, proof id, signature and timestamp.
'b92e904d8819b670761e903f3d788da3ccea2db1ed9253d9fdbab427fe87022a9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be553ae992fa3b9a7fd6b6792936c2a6e6dcfbb3f091e2994df0c5cdb901e92e4abccb7ef9408028283a08c32e199036755c2401ddec831f6fad244c7aa7af8e7d4dff691c97add18871d32ec3c6c487f2433f51bf4ef3d9b2d58459aeff3b8016?stamp=1700172943'
```

Also, proofs use the same signing method as nostr notes, so technically any proof can be converted into a valid nostr note, and vice-versa. Valid proofs can also be constructed usings nostr-based signing devices (such as `NIP-07` based extensions).

```ts
// A parsed proof will look like this:
interface ProofData {
  ref    : string
  pub    : string
  pid    : string
  sig    : string
  params : string[][]
}
```

The CVM is designed to be extensibe. It will support many hooks and cross-platform integrations in the future. It is also a work in progress, so expect bugs.

## Deposits

Deposits are the most magical part of the protocol, and a good amount of engineering has been poured into their construction.

To start, each deposit account is a time-locked 2-of-2 taproot address. All deposits are guaranteed refundable, and the script path is only revealed in a worst-case scenario.

In addition, this address is constructed using an extended version of the musig2 protocol, optimized for non-interactive signing a batch of transactions. This protocol is compatible with BIP327 and does not comprimise on any of the security features in the specification.

```ts
interface DepositData {
  agent_id     : string
  agent_key    : string
  agent_pn     : string
  block_hash   : string | null
  block_height : number | null
  block_time   : number | null
  confirmed    : boolean
  covenant     : CovenantData | null
  created_at   : number
  expires_at   : number | null
  deposit_id   : string
  deposit_key  : string
  return_tx    : string
  scriptkey    : string
  sequence     : number
  settled      : boolean
  settled_at   : number | null
  spent        : boolean,
  spent_at     : number | null
  spent_txid   : string | null
  status       : DepositStatus
  txid         : string
  updated_at   : number
  value        : number
  vout         : number
}
```

It is important to note that a deposit can be released from one contract, and signed to another, without requiring an on-chain transaction. This is particularly useful if a contract expires or is otherwise cancelled, as the deposits can be reused immediately.

The caveat with this is that there is currently no revocation protocol in place for past covenants, so technically the agent has a limited opportunity to double-spend. There are plans to impove the off-chain use of deposits in a future version of the protocol.

```ts
type DepositStatus =
'reserved' | // An account has been reserved, no deposit registered.
'pending'  | // Deposit is registered in mempool and ready for signing.
'stale'    | // Deposit is stuck in mempool, must wait for confirmation.
'open'     | // Deposit is confirmed and ready for signing
'locked'   | // Deposit is currently locked to a covenant.
'spent'    | // Deposit has been spent and is in the mempool.
'settled'  | // Deposit spending tx has been confirmed.
'expired'  | // Deposit time-lock is expired, no longer secured.
'error'      // Something went wrong, may need manual intervention.
```

When a contract is settled, it will appear on the blockchain as a simple P2TR (Pay to Taproot) transaction. No information about the contract, its depositors, or its participating members, are ever revealed.

## Covenants

A covenant is created using a custom protocol that wraps the musig2 protocol, and allows us to perform batch signing of transactions. It involves the use of a `root` nonce value for each signing member, which is then further tweaked in a non-interactive way. Each tweaked nonce value is then used in a standard musig2 signing session.

In regards to scaling, the protocol is O(1) for the coordinated negotiation of root nonces, requires O(n = outputs) partial signatures from each depositor, and O(n * m = depositors) for verification of signatures by the agent.

The protocol is relatively simple:

* All parties compute a hash that commits to the full terms of the contract.
  > Ex: hash340('root_nonce', serialize(contract_terms))
* Each member uses this hash to produce a root nonce value using BIP340 nonce generation.
* The agent includes their root public nonce value with the contract.
* For _each_ transaction, the depositor performs the following:
  - The depositor computes a second commitment that includes both root pnonces, plus the transaction.
    > Ex: hash340('contract/root_tweak', depositor_root_pnonce, agent_root_pnonce, sighash(tx))
  - This second hash is used to tweak the root pnonce for both the depositor and the agent.
  - The new pnonce values are used to compute a musig2 signing session, plus partial signature for the transaction.
* Each depositor delivers their pubkey, root pnonce value and payload of signatures to the agent.
* The agent can select a particular transaction, compute the tweak and musig context, then finalize the signature.

The purpose of the root nonce value is to guarantee that each derived nonce value is computed fairly, regardless of whom performs the computation. Each tweak extends the commitment of the root nonce value to the specific transaction being signed.

The root nonce value is never used directly in any signing operation. Each partial signature is computed using a derived nonce, via the standard musig2 protocol. This includes a full commitment to the session state and tweaked nonce values.

```ts
export interface CovenantData {
  cid    : string
  pnonce : string
  psigs  : [ string, string ][]
}
```

Each signature is flagged using the sighash flag ANYONECANPAY, allowing each deposit to be included among any combination of other inputs signed to the contract. Once all deposits and covenants have been collected for a given contract (and verified by the agent), the contract is considered active.

## Signatures and Signing Devices

The entire protocol, software, and supporting libraries have been designed from the ground-up to incorprate signing devices at all costs. Every interaction with a user's private key is done with the concept of a signing device in mind, and all signature methods in the procotol **require** a signing device as input.

In addition, the protocol is designed with the assumption that the contract agent is a dirty scoundrel who will swindle your private keys away from you using the worst tricks imaginable. All signature methods in the protocol **require** a signing device to generate nonce values and perform key operations, and **zero** trust is given to any counter-party during the signing process.

Even the musig part of the protocol has been extended to require secure nonce generation *within the device* as part of the signing process.

However, since we are using state-of-the-art cryptography, there is a lack of devices out there that can deliver what we need in order to build the best escrow platform on the planet.

Therefore included as part of the escrow-core library is a reference implementation of a software-based signing device.

This purpose of this signer is to act as a place-holder in the protocol, and clearly define what interactions take place, what information is exchanged, and what cryptographic primitives are required.

```ts
class Signer {
  // Generates a signing device from a random 32-byte value.
  static generate (config ?: SignerConfig) : Signer
  // Generates a signing device from the sha-256 hash of a passphrase.
  static seed (seed : string, config ?: SignerConfig ): Signer;
  // Provides a signing device for a given secret and configuration.
  constructor(secret: Bytes, config?: SignerConfig);
  // Provides a sha256 hash of the public key.
  get id(): string;
  // Provides the x-only public key of the device.
  get pubkey(): string;
  // Derives a key-pair from a derivation path. Accepts numbers and strings.
  derive(path: string): Signer;
  // Computes a shared-secret with the provided public key/
  ecdh(pubkey: Bytes): Buff;
  // Generates a nonce value for a given message, using BIP340.
  gen_nonce(message: Bytes, options?: SignerOptions): Buff;
  // Performs an HMAC operation using the device's internal secret.
  hmac(message: Bytes): Buff;
  // Produces a musig2 partial signature using the supplied context.
  musign(context: MusigContext, auxdata: Bytes, options?: SignerOptions): Buff;
  // Produces a BIP340 schnorr signature using the provided message.
  sign(message: Bytes, options?: SignerOptions): string;
}
```

There are three main primitives that are required in order to use the protocol:

- Schnorr signatures (BIP340).
- Musig signatures (BIP327, plus BIP340 nonce generation).
- Additional tweaks during nonce generation (for the batch covenant signing).

There's also a few neat tricks planned for a future release, so the reference signer comes packed with extra goodies.

The current Signer API represents what a first-class signing device should be able to do. A future version of the API may require methods for performing internal validation, as trusting third-party software for validation of cryptographic proofs is not a good practice.

## Escrow Client

In addition to the core protocol, this repository includes a client library for communicating with our escrow server.

```ts
export default class EscrowClient {
  constructor (
    signer   : Signer, 
    options ?: ClientOptions
  )

  contract: {
    cancel : (cid: string)             => Promise<EscrowContract>,
    create : (proposal : ProposalData) => Promise<EscrowContract>,
    list   : ()                        => Promise<EscrowContract[]>
    read   : (cid: string)             => Promise<EscrowContract>
    status : (cid: string)             => Promise<EscrowContract>
  }

  covenant: {
    add    : (
      contract : ContractData | EscrowContract, 
      deposit  : DepositData  | EscrowDeposit
    ) => Promise<EscrowDeposit>
    list   : (cid : string)        => Promise<EscrowDeposit[]>
    remove : (deposit_id : string) => Promise<EscrowDeposit>
  }

  deposit: {
    close: (
      address : string, 
      deposit : DepositData | EscrowDeposit,
      txfee  ?: number | undefined
    ) => Promise<EscrowDeposit>
    create: (
      agent_id  : string, 
      agent_key : string, 
      sequence  : number,
      txid      : string,
      options  ?: DepositConfig
    ) => Promise<DepositTemplate>
    list     : () => Promise<EscrowDeposit[]>
    read     : (deposit_id : string)        => Promise<EscrowDeposit>
    register : (template : DepositTemplate) => Promise<EscrowDeposit>
    request  : (params ?: Record)           => Promise<DepositInfo>
    status   : (deposit_id : string)        => Promise<EscrowDeposit>
  }

  oracle: {
    broadcast_tx   : (txhex: string)      => Promise<Resolve<string>>
    fee_estimates  : ()                   => Promise<OracleFeeEstimate>
    get_fee_target : (target: number)     => Promise<number>
    get_tx_data    : (txid: string)       => Promise<OracleTxData | null>
    get_spend_out  : (query: OracleQuery) => Promise<OracleSpendData | null>
  }

  witness: {
      list : (cid: string) => Promise<WitnessData[]>
      read : (wid: string) => Promise<WitnessData>
      submit: (
        cid     : string, 
        witness : WitnessEntry
      ) => Promise<EscrowContract>
  }
}
```

More documentation coming soon!

## Whitepaper

There is work being done on a white-paper that focuses on the technical details of the protocol (including the good, bad, and ugly) in order to make things official and invite the sweet wrath of academic scrutiny.

## Development / Testing

The documentation for development and testing is currently being fleshed out for an open beta release.

If you want to see a naive end-to-end demonstration of the of the protocol, you can use the follwoing command:

```bash
## Using Yarn:
VERBOSE=true yarn test
## Using NPM:
VERBOSE=true npm run test
```

This should spin up an isolated `regtest` version of Bitcoin core (which comes packaged with the repo), and run a flurry of methods which exercise the entire protocol. The full end-to-end test is located in `test/src/tests/e2e.test.ts`.

Over the next month, we'll be adding more concrete examples using the `EscrowClient`, plus opening our escrow server to public beta on `testnet` and `mutinynet`.

Please stay tuned!

## Issues / Questions / Comments

Please feel free to post any kind of issue on the tracker. All feedback is welcome.

## Contribution

Help wanted. All contributions are welcome. :-)

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
