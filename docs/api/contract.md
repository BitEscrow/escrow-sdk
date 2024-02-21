# Contract API

Reference guide for the BitEscrow Contract API. Click on the links below to navigate:

- [/api/contract/create](#create-a-contract)
- [/api/contract/list/:pubkey](#list-contracts-by-pubkey)
- [/api/contract/:cid](#read-a-contract-by-id)
- [/api/contract/:cid/cancel](#cancel-a-contract)
- [/api/contract/:cid/digest](#read-a-contract-digest)
- [/api/contract/:cid/funds](#list-funds-in-a-contract)
- [/api/contract/:cid/status](#read-a-contract-status)
- [/api/contract/:cid/submit](#submit-a-witness-statement)
- [/api/contract/:cid/vmstate](#read-a-contract-vm-state)
- [/api/contract/:cid/witness](#list-statements-in-a-contract)

> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

## Create a Contract

Create a new contract on the escrow server.

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

**Related Interfaces**

- [ProposalData](../data/proposal.md#proposaldata)
- [ContractData](../data/contract.md#contractdata)

## List Contracts By Pubkey

Request a list of contracts that are tagged by a specific pubkey.

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

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)

## Read a Contract By Id

Fetch a contract from the server by its contract id (cid).

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

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)

## Cancel a Contract

Request to cancel a contract (must be the moderator).

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

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)

## Read a Contract Digest

Fetch a more compact version of the contract (for polling).

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
**Related Interfaces:**

- [ContractDigest](../data/contract.md#contractdigest)

## List Funds in a Contract

Request a list of funds that are locked to a contract id (cid).

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

**Related Interfaces:**

- [DepositDigest](../data/deposit.md#depositdigest)

## Read a Contract Status

Fetch a contract's current status via the contract id (cid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/status'
```

**Response Interface**

```ts
export interface ContractStatusResponse {
  data : {
    contract : {
      status     : ContractStatus
      updated_at : number
    }
  }
}
```

Related Interfaces:

- [ContractStatus](../data/contract.md#contractstatus)

## Submit a Witness Statement

Submit a witness statement to the contract VM.

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

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)
- [WitnessData](../data/witness.md#witnessdata)

## Read a Contract VM State

Fetch a contract's machine state via the contract id (cid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/vmstate'
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

Related Interfaces:

- [ContractStatus](../data/contract.md#contractstatus)
- [StateData](../data/contract.md#statedata)

## List Statements in a Contract

Request all recorded witness statements for a contract.

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

**Related Interfaces:**

- [WitnessData](../data/witness.md#witnessdata)
