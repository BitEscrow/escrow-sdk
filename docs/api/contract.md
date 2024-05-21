# Contract API

Reference guide for the BitEscrow Contract API. Click on the links below to navigate:

| Endpoint | Description |
|----------|-------------|
| [/api/contract/create](#create-a-contract)      | Create a new contract on the escrow server. |
| [/api/contract/list](#list-contracts-by-pubkey) | List contracts by pubkey. |
| [/api/contract/:cid](#read-a-contract-by-id)    | Read a contract via ID. |
| [/api/contract/:cid/cancel](#cancel-a-contract) | Cancel a contract. |
| [/api/contract/:cid/funds](#list-funding-by-id) | List the funds deposited in a contract. |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

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
export interface ContractRequest {
  endorsements ?: string[]
  proposal      : ProposalData
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

**Example Request**

```ts
// Define the script engine to use.
const engine = CVM
// Define the server policy to use.
const policy = config.policy.proposal
// Define a proposal and optional endorsements.
const req = { endorsements, proposal }
// Deliver the publish request to the server.
const res = await client.contract.create(req, engine, policy)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our published contract.
const { contract } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/contract/create.ts).

**Example Response**

- [ContractData](../examples/contractdata.md)

**Related Interfaces**

- [ContractData](../data/contract.md#contractdata)
- [ProposalData](../data/draft.md#proposaldata)
- [ScriptEngine](../data/machine.md#scriptengine-api)
- [ServerPolicy](../data/server.md#serverpolicy)

---

## List Contracts By Pubkey

Request a list of contracts that are endorsed by the token's pubkey.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/list'
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

**Example Request**

```ts
// Generate a request token.
const req = signer.contract.list()
// Submit the request and token.
const res = await client.contract.list(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data payload.
const { contracts } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/contract/list.ts).

**Related Interfaces**

- [ContractData](../data/contract.md#contractdata)

---

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

**Example Request**

```ts
// Fetch a contract from the server by cid.
const res = await client.contract.read(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const { contract } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/contract/read.ts).

**Example Response**

- [ContractData](../examples/contractdata.md)

**Related Interfaces**

- [ContractData](../data/contract.md#contractdata)

---

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

**Example Code**

```ts
// Generate an auth token from the moderator's signer.
const req = signer.contract.cancel(cid)
// Send the cancel request, along with the auth token.
const res = await client.contract.cancel(cid, req)
// If the request fails, throw an error.
if (!res.ok) throw new Error(res.error)
// Unwrap our response payload.
const { contract } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/contract/cancel.ts).

**Example Response**

- [ContractData](../examples/contractdata.md)

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)

---

## List Funding By Id

Fetch a list of funds for a contract id (cid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/funds'
```

**Response Interface**

```ts
interface FundListResponse {
  data : {
    funds : FundingData[]
  }
}
```

**Example Request**

```ts
// Fetch a contract from the server by cid.
const res = await client.contract.funds(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const { funds } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/contract/funds.ts).

**Related Interfaces**

- [FundingData](../data/contract.md#fundingdata)