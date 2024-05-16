# Contract Interfaces

List of interfaces for the Contract API. Click on the links below to navigate:

- [ContractData](#contractdata)
- [ContractStatus](#contractstatus)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## ContractData

The main data interface for a contract object.

```ts
interface ContractData {
  cid          : string            // The hash identifier of the contract.
  created_at   : number            // The timestamp for when the contract was published.
  created_sig  : string            // A signature from the server_pk that signs the cid.
  deadline_at  : number            // Timestamp for when a contract must be funded.
  endorsements : string[]          // A list of signatures for endorsing the contract.
  fees         : PaymentEntry      // The fees being charged by the server agent.
  feerate      : number            // The current selected feerate of the contract.
  funds_pend   : number            // Amount of funds that are pending confirmation.
  funds_conf   : number            // Amount of funds that are confirmed for the contract.
  moderator    : string | null     // The public key for the moderator of the contract.
  outputs      : SpendTemplate[]   // A list of spending templates the contract can use.
  prop_id      : string            // The hash identifier of the proposal terms.
  status       : ContractStatus    // The current status of the contract.
  subtotal     : number            // The subtotal value of the contract (terms + fees).
  terms        : ProposalData      // The original proposal terms of the contract.
  tx_bsize     : number            // The estimated base size of the spending transaction.
  vin_count    : number            // The number of confirmed inputs into the transaction.
  vin_txfee    : number            // The txfee for adding a funding input to the contract.
  updated_at   : number            // A timestamp for when the contract was updated.
}
```

The `ContractData` interface is extended by state interfaces, each one describing a state-change:

```ts
interface ContractPublishState {
  canceled     : boolean        // Whether the contract is canceled.
  canceled_at  : number | null  // UTC timestamp when the contract was canceled.
  canceled_sig : string | null  // A confirmation signature from the escrow server.
}

interface ContractFundingState {
  secured      : boolean        // Whether the contract funds are secured.
  secured_sig  : string | null  // A confirmation signature from the escrow server.
  effective_at : number | null  // The UTC date when the contract will activate.
  tx_fees      : number | null  // The total transaction fees marked for the contract.
  tx_vsize     : number | null  // The total size (in vbytes) of the spending transaction.
  tx_total     : number | null  // The total value (subtotal + txfees) of the transaction.
}

interface ContractActiveState {
  activated   : boolean         // Whether the contract vm is active. 
  active_at   : number | null   // UTC timestamp when the contract was activated.
  active_sig  : string | null   // A confirmation signature from the escrow server.
  engine_vmid : string | null   // The unique id of the machine executing the contract.
  expires_at  : null | number   // UTC deadline for when contract execution must expire.
}

interface ContractExecState {
  closed      : boolean         // Whether the contract vm is running. 
  closed_at   : number | null   // UTC timestmap when the contract vm finished executing.
  closed_sig  : string | null   // A confirmation signature from the escrow server.
  engine_head : string | null   // The final hash of the commit-chain for the machine.
  engine_vout : string | null   // The final output of the contract virtual machine.
}

interface ContractSpendState {
  spent       : boolean,          // Whether the contract funds have been spent.
  spent_at    : number | null     // UTC timestamp when the contract funds were spent.
  spent_txhex : string | null     // The body of the spending transaction (in hex).
  spent_txid  : string | null     // The transaction id for the spending transaction.
}

interface ContractSettledState {
  settled     : boolean           // Whether the contract funds have been settled.
  settled_at  : number | null     // UTC timestamp for when the contract was settled.
}
```

## ContractStatus

The various states that a contract may go through.

```ts
type ContractStatus = 
  'published' |  // Contract is published and awaiting funding.
  'funded'    |  // Contract is funded. Funds awaiting confirmation.
  'secured'   |  // Contract funds are confirmed. Awaiting activation.
  'active'    |  // Contract is active and machine is running.
  'closed'    |  // Contract machine is closed. Awaiting settlement.
  'spent'     |  // Contract funds are spent. Awaiting confirmation.
  'settled'   |  // Contract is considered settled. Funds are spent/released.
  'canceled'  |  // Contract is canceled and funds are released.
  'expired'   |  // Contract execution has expired. Funds are released.
  'error'        // Something went wrong. May require manual intervention.
```
