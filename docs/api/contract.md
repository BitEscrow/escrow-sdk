# Contract API

Reference guide for the BitEscrow Contract API. Click on the links below to navigate:

- [/api/contract/create](#create-a-contract)
- [/api/contract/list/:pubkey](#list-contracts-by-pubkey)
- [/api/contract/:cid](#read-a-contract-by-id)
- [/api/contract/:cid/cancel](#cancel-a-contract)
- [/api/contract/:cid/digest](#read-a-contract-digest)
- [/api/contract/:cid/funds](#list-funds-in-a-contract)
- [/api/contract/:cid/submit](#submit-a-witness-statement)
- [/api/contract/:cid/vm](#read-a-contract-vm-state)
- [/api/contract/:cid/witness](#list-statements-in-a-contract)

> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

## Create a Contract

Create a new contract on the escrow server.

API Demo:

- [/demo/api/contract/create](../../demo/api/contract/create.ts)

Related interfaces:

- [ProposalData](../interfaces/proposal.md#proposaldata)
- [ContractData](../interfaces/contract.md#contractdata)

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/contract/create'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(contract_request)
```

**Request Body**

```ts
interface ContractRequest {
  proposal    : ProposalData
  signatures ?: string[]
}
```

**Response Interface**

```ts
interface ContractDataResponse {
  data : {
    contract : ContractData
  }
}
```

## List Contracts By Pubkey

Request a list of contracts that are tagged by a specific pubkey.

API Demo:

- [/demo/api/contract/list](../../demo/api/contract/list.ts)

Related interfaces:

- [ContractData](../interfaces/contract.md#contractdata)

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/list/:pubkey'
headers  : { 'Authorization' : 'Token ' + auth_token }
```

**Response Interface**

```ts
interface ContractListResponse {
  data : {
    contracts : ContractData[]
  }
}
```

## Read a Contract By Id

Fetch a contract from the server by its contract id (cid).

API Demo:

- [/demo/api/contract/read](../../demo/api/contract/read.ts)

Related interfaces:

- [ContractData](../interfaces/contract.md#contractdata)

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid'
```

**Response Interface**

```ts
interface ContractDataResponse {
  data : {
    contract : ContractData
  }
}
```

## Cancel a Contract

Request to cancel a contract (must be the moderator).

API Demo:

- [/demo/api/contract/cancel](../../demo/api/contract/cancel.ts)

Related interfaces:

- [ContractData](../interfaces/contract.md#contractdata)

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/cancel'
headers  : { 'Authorization' : 'Token ' + auth_token }
```

**Response Interface**

```ts
interface ContractDataResponse {
  data : {
    contract : ContractData
  }
}
```

## List Funds in a Contract

Request a list of funds that are locked to a contract id (cid).

API Demo:

- [/demo/api/contract/funds](../../demo/api/contract/funds.ts)

Related interfaces:

- [DepositDigest](../interfaces/deposit.md#depositdigest)

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/funds'
```

**Response Interface**

```ts
interface FundListResponse {
  data : {
    funds : DepositDigest[]
  }
}
```

## Read a Contract Digest

Fetch a more compact version of the contract (for polling).

API Demo:

- [/demo/api/contract/digest](../../demo/api/contract/digest.ts)

Related interfaces:

- [ContractDigest](../interfaces/contract.md#contractdigest)

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/digest'
```

**Response Interface**

```ts
interface ContractDigestResponse {
  data : {
    contract : ContractDigest
  }
}
```

## Submit a Witness Statement

Submit a witness statement to the contract VM.

API Demo:

- [/demo/api/contract/submit](../../demo/api/contract/submit.ts)

Related interfaces:

- [ContractData](../interfaces/contract.md#contractdata)
- [WitnessData](../interfaces/witness.md#witnessdata)

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/contract/:cid/submit'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(witness_request)
```

**Request Body**

```ts
interface WitnessRequest {
  witness : WitnessData
}
```

**Response Interface**

```ts
interface ContractDataResponse {
  data : {
    contract : ContractData
  }
}
```

## Read a Contract VM State

Fetch a contract's machine state via the contract id (cid).

API Demo:

- [/demo/api/contract/vmstate](../../demo/api/contract/vmstate.ts)

Related Interfaces:

- [ContractStatus](../interfaces/contract.md#contractstatus)
- [StateData](../interfaces/contract.md#statedata)

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/vm'
```

**Response Interface**

```ts
interface ContractVMStateResponse {
  data : {
    status     : ContractStatus
    updated_at : number
    vm_state   : StateData
  }
}
```

## List Statements in a Contract

Request all recorded witness statements for a contract.

API Demo:

- [/demo/api/contract/witness](../../demo/api/contract/witness.ts)

Related interfaces:

- [WitnessData](../interfaces/witness.md#witnessdata)

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/witness'
```

**Response Interface**

```ts
interface WitnessListResponse {
  data : {
    statements : WitnessData[]
  }
}
```
