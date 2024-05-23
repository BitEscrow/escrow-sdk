# Witness API

Reference guide for the BitEscrow Witness API.

| Endpoint | Description |
|----------|-------------|
| [/api/witness/list](#list-statements-by-pubkey) | List statements by pubkey. |
| [/api/witness/:wid](#read-a-statement-by-id)    | Fetch a statement by ID.   |

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
    receipts : WitnessReceipt[]
  }
}
```

**Example Request**

```ts
// Generate a request token.
const req = signer.witness.list()
// Submit the request and token.
const res = await client.witness.list(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data payload.
const { receipts } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/witness/list.ts).

**Related Interfaces:**

- [WitnessReceipt](../data/witness.md#witness-receipt)


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
    receipt : WitnessReceipt
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
const { receipt } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/witness/read.ts).

**Example Response**

- [WitnessReceipt](../examples/WitnessReceipt.md)

**Related Interfaces:**

- [WitnessReceipt](../data/witness.md#witness-receipt)
