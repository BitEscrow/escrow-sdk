# Machine API

Reference guide for the virtual machine API.

| Endpoint | Description |
|----------|-------------|
| [/api/machine/list](#list-machines-by-pubkey)         | List machines by pubkey.  |
| [/api/machine/submit](#submit-a-witness-statement)    | Submit a new statement.   |
| [/api/machine/:vmid](#read-a-machine-by-id)           | Fetch a machine by ID.    |
| [/api/machine/:vmid/receipts](#list-machine-receipts) | List receipts by machine. |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## List Machines By Pubkey

Request a list of machines that are accessible by the token's pubkey.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/machine/list'
headers  : { 'Authorization' : 'Token ' + auth_token }
```

**Response Interface**

```ts
interface VMListResponse {
  data : {
    machines : MachineData[]
  }
}
```

**Example Request**

```ts
// Generate a request token.
const req = signer.machine.list()
// Deliver the request and token.
const res = await client.machine.list(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data payload.
const { machines } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/machine/list.ts).

**Related Interfaces**

- [MachineData](../data/machine.md#machine-data)

---

## Submit a Witness Statement

Submit a witness statement to a virtual machine.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/machine/submit'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(submit_request)
```

**Request Body**

```ts
interface VMSubmitRequest {
  witness : WitnessData
}
```

**Response Interface**

```ts
export interface VMSubmitResponse {
  data : {
    receipt : WitnessReceipt
    vmdata  : MachineData
  }
}

```

**Example Request**

```ts
// Create a statement template.
const template = {
  action : 'close',
  method : 'endorse',
  path   : 'payout'
}
// Initialize a variable for our witness data.
let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.create(vmstate, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(vmstate, witness)
// Submit the signed statement to the server.
const res = await client.machine.submit(vmid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data from the response.
const { receipt, vmdata } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/machine/submit.ts).

**Related Interfaces:**

- [MachineData](../data/machine.md#machine-data)
- [WitnessReceipt](../data/witness.md#witness-receipt)

---

## Read a Machine By ID

Fetch machine data from the server by its identifier (vmid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/machine/:vmid'
```

**Response Interface**

```ts
export interface VMDataResponse {
  data : {
    vmdata : MachineData
  }
}
```

**Example Request**

```ts
// Fetch record from the server via id.
const res = await client.machine.read(vmid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const { vmdata } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/machine/read.ts).

**Example Response**

- [MachineData](../examples/MachineData.md)

**Related Interfaces**

- [MachineData](../data/machine.md#machine-data)

---

## List Machine Receipts

Request all witness receipts for a virtual machine.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/machine/:vmid/receipts'
```

**Response Interface**

```ts
interface WitnessListResponse {
  data : {
    receipts : WitnessCommit[]
  }
}
```

**Example Request**

```ts
// Fetch a contract from the server by cid.
const res = await client.machine.commits(vmid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const { receipts } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/machine/commits.ts).

**Related Interfaces:**

- [WitnessReceipt](../data/witness.md#witness-receipt)
