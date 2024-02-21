# Contract Docs

A contract is the published version of a [proposal](proposal.md). It is hosted by the escrow server, and executed through the use of a virtual machine.

**Sections**

1. [Creating a Contract](#creating-a-contract)
2. [Funding a Contract](#funding-a-contract)
3. [Using the Virtual Machine (CVM)](#using-the-virtual-machine-cvm)
4. [Contract Settlement](#contract-settlement)
5. [Contract Expiration](#contract-expiration)

**Resources**

- [Contract API Routes](./api/contract.md)
- [Contract Interfaces](./data/contract.md)

> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

## Creating a Contract

Before creating a contract, you will need a completed [proposal](proposal.md#building-a-proposal) document, and (optional) signatures of endorsement.

To create a contract, simply provide these documents to the server using the `/contract/create` endpoint:

```ts
// Publish proposal and endorsements to server.
const res = await client.contract.create(proposal, signatures)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)

const { contract } = res.data
```

If there are no errors with your submission, you will receive a [ContractData](../docs/data/contract.md#contractdata) object in response.

## Funding a Contract

Once a contract is published, it is open to funding from [depositors](deposit.md#depositing-funds).

The [ContractData](../docs/data/contract.md#contractdata) interface has three fields for tracking funding: `balance`, `pending`, and `total`.

**Pending**: Funds are locked to the contract, but not confirmed on-chain.  
**Balance**: Funds are locked to the contract, and confirmed on-chain.  
**Total**: The total amount required to fund the contract (inc. txfees).

> The `total` value will update as new funds are locked to the contract, as each new input increases the size of the settlement tx, and thus the txfees!

If the contract is not funded by the `deadline` listed in the contract, then the contract is cancelled.

If there is a `moderator` specified in the contract, then the moderator can also decide to cancel the contract, if the contract is not fully funded and confirmed.

Once the contract `balance`, exceeds the `total`, then the contract is locked and ready to activate.

If there is an `effective` date set in the contract, then activation will be delayed until that date. Otherwise, the contract will activate immediately.

## Using the Virtual Machine (CVM)

Once a contract is activated, a virtual machine within the contract is initialized, called the [CVM](./data/contract.md#statedata).

The CVM is initialized based upon the `terms` of the contract (and original [proposal](./data/proposal.md#proposaldata)).

Members of the contract can interact with the CVM by providing signed statements, called a [witness](./data/witness.md):

```ts
// Start with a witness template.
const template : WitnessTemplate = {
  action : 'close',    // We want to close the contract.
  method : 'endorse',  // Using the 'endorse' (signature) method.
  path   : 'payout'    // Settling on the 'payout' path.
}
```

Members can use their signing device to create a new statement, or endorse an existing statement from another member:

```ts
// Example list of signers.
const [ a_signer, b_signer ] : EscrowSigner[] = signers
// Initialize a variable for our witness data.
let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.sign(contract, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(contract, witness)
```

Each statement is first verified by the server, then evaluated inside the CVM. If the statement is valid, it is added to the `commit` history of the CVM, and the `head` of the hash-chain is updated.

Members can check the `commit` history and `head` to verify that all updates to the CVM are valid.

## Contract Settlement

Each time the CVM is updated, it checks the closing conditions of the contract, and evaluates if a condition has been met.

If a closing condition is satisfied, the CVM will return the associated spending `path` as output. The escrow server will then complete the [covenant](./data/deposit.md#covenantdata) for each locked deposit, and broadcast a final settlement transaction.

When this happens, the `spent` boolean on the contract will be set, and the `spent_txid` field will record the on-chain txid of the settlement transaction.

## Contract Expiration

Each active contract is given a strict expiration date, due to the time-lock on the underlying funds. This is recorded in the `expires_at` field of the contract interface.

If an active contract reaches its expiration date, then the contract is cancelled, and all locked funds are released back to the depositors.

To avoid having your contract expire in such a manner, consider using a catch-all `task` in your proposal that will settle the contract under _any_ condition:

```ts
const proposal = {
  ...other_terms,
  expires : 7200,  // Duration of 2 hours.
  schedule : [
    // One second before contract expiration, 
    // try to release, then close, then resolve.
    [ 7199, 'release|close|resolve', 'payout' ]
  ]
```

For more information on scheduling tasks, see [Building a Proposal](./proposal.md#building-a-proposal)
