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
  commits  : [],
  head     : 'df015d478a970033af061c7ed0152b97907c148b51353a8a33f79cf0b3d87350',
  paths    : [ [ 'payout', 0 ], [ 'return', 0 ] ],
  programs : [],
  result   : null,
  start    : 1696362768,
  status   : 'init',
  steps    : 0,
  store    : [],
  updated  : 1696362768
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

Currently, the CVM only supports one method, and that is the `endorse` method. This method is designed to accept a number of signatures, then execute an action based on a quorum of signatures being reached. The threshold for this quorm is defined in the proposal terms.

The `endorse` method uses that are designed to be easy to work with. They are inspired by `NIP-26` delegation proofs, and can support an optional query string to provide additional parameters.

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
