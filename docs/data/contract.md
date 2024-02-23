# Contract Interfaces

List of interfaces for the Contract API. Click on the links below to navigate:

- [ContractData](#contractdata)
- [ContractDigest](#contractdigest)
- [ContractStatus](#contractstatus)
- [StateData](#statedata)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## ContractData

This is the full interface of a contract object.

```ts
interface ContractData {
  activated   : null | number     // Timestamp for when a contract was activated.
  agent_fee   : PaymentEntry      // The fees being charged by the server agent.
  agent_id    : string            // The id of the server agent.
  agent_pk    : string            // The public key of the server agent.
  agent_pn    : string            // The public nonce of the server agent.
  balance     : number            // The current confirmed balance of the contract.
  cid         : string            // The hash identifier of the contract.
  deadline    : number            // Timestamp for when a contract must be funded.
  est_txfee   : number            // The estimated txfee for the contract and deposits.
  est_txsize  : number            // The estimated size for the contract and deposits.
  expires_at  : null | number     // The absolute expiration date of the contract.
  feerate     : number            // The current selected feerate of the contract.
  moderator   : string | null     // The public key for the moderator of the contract.
  outputs     : SpendTemplate[]   // A list of spending templates the contract can use.
  pending     : number            // The current unconfirmed balance of the contract.
  pubkeys     : string[]          // A list of public keys that can index this contract.
  prop_id     : string            // The hash identifier of the proposal terms.
  published   : number            // The timestamp for when the contract was published.
  settled     : boolean           // A boolean for whether a settlement has been confirmed.
  settled_at  : number | null     // The timestamp for when the contract was confirmed.
  signatures  : string[]          // A list of signatures for endorsing the contract.
  spent       : boolean,          // A boolean for whether the contract funds have been spent.
  spent_at    : number | null     // A timestamp for when the contract funds were spent.
  spent_txid  : string | null     // The transaction id for the contract spending transaction.
  status      : ContractStatus    // The current status of the contract.
  subtotal    : number            // The subtotal value of the contract (terms + fees).
  terms       : ProposalData      // The original proposal terms of the contract.
  total       : number            // The total value of the contract (subtotal + txfees).
  updated_at  : number            // A timestamp for when the contract was updated.
  vm_state    : null | StateData  // The current state of the contract's virtual machine.
  vout_size   : number            // The size of the largest spending output of the contract.
}

```

## ContractDigest

This interface is a compact version of the contract data, used for updates.

```ts
interface ContractDigest {
  activated  : number | null
  balance    : number
  est_txsize : number
  est_txfee  : number
  pending    : number
  settled    : boolean
  spent      : boolean
  spent_txid : string | null
  status     : ContractStatus
  total      : number
  txin_count : number
  updated_at : number
}

```

## ContractStatus

This type defines the different statuses that a contract may be in.

```ts
type ContractStatus = 
  'published' |  // Contract is published and awaiting funds. 
  'funded'    |  // Contract is funded and awaiting confirmation.
  'secured'   |  // Contract funds are confirmed and awaiting activation.
  'pending'   |  // Contract is in the process of being activated.
  'active'    |  // Contract is active and CVM is running.
  'closed'    |  // Contract is closed and awaiting settlement.
  'spent'     |  // Contract is settled and awaiting confirmation.
  'settled'   |  // Contract is settled and confirmed on-chain.
  'canceled'  |  // Published contract is canceled and funds are released.
  'expired'   |  // Active contract has expired and funds are released.
  'error'        // Something went wrong, may require manual intervention.
```

## StateData

This interface represents the state of the virtual machine.

```ts
interface StateData {
  commits  : CommitEntry[]   // List of commits to the VM.
  error    : string | null   // Error output of the VM.
  head     : string          // Current head of the commit-chain.
  output   : string | null   // Standard output of the VM.
  paths    : StateEntry[]    // List of spend paths and their current state.
  programs : ProgramEntry[]  // List of programs available in the VM.
  steps    : number          // Counter of state updates to the VM.
  start    : number          // Timestamp for when the VM was initialized.
  status   : PathStatus      // Current status of the VM.
  store    : StoreEntry[]    // Data store for each program in the VM.
  tasks    : TaskEntry[]     // List of upcoming tasks within the VM.
  updated  : number          // Timestamp for when the VM was last updated.
}

```