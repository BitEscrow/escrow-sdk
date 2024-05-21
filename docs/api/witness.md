# Witness API

Reference guide for the BitEscrow Witness API. Click on the links below to navigate:

| Endpoint | Description |
|----------|-------------|
| [/api/witness/:wid](#read-a-statement-by-id) | Fetch a witness statement from the server by id (wid). |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## List Statements By Pubkey

Request a list of statements that are endorsed by the token's pubkey.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/witness/list'
headers  : { 'content-type' : 'application/json' }
```

**Response Interface**

```ts
interface WitnessListResponse {
  data : {
    statements : WitnessReceipt[]
  }
}
```

**Example Request**

```ts
// Deliver proposal and endorsements to server.
const res = await client.contract.create(draft)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our published contract.
const new_contract = res.data.contract
```

**Related Interfaces**

- [MachineData](../data/machine.md#machinedata)

---

## Read a Statement By Id

Fetch a witness statement from the server by its identifier (wid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/witness/:wid'
```

**Response Interface**

```ts
interface WitnessDataResponse {
  data : {
    statement : WitnessReceipt
  }
}
```

**Example Request**

```ts
// Fetch a contract from the server by cid.
const res = await client.witness.read(wid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const { statement } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/witness/read.ts).

**Example Response**

- [WitnessReceipt](../examples/witnessreceipt.md)

**Related Interfaces:**

- [WitnessReceipt](../data/witness.md#witnessreceipt)
