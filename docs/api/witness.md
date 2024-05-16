# Witness API

Reference guide for the BitEscrow Witness API. Click on the links below to navigate:

| Endpoint | Description |
|----------|-------------|
| [/api/witness/:wid](#read-a-statement-by-id) | Fetch a witness statement from the server by id (wid). |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Read a Statement By WID

Fetch a witness statement from the server by id (wid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/witness/:wid'
```

**Response Interface**

```ts
interface WitnessDataResponse {
  data : {
    witness : WitnessData
  }
}
```

**Example Request**

```ts
import { client }  from '@scrow/demo/01_create_client.js'
import { witness } from '@scrow/demo/09_settle_contract.js'

// Define the witness id we will use.
const wid = witness.wid
// Fetch a contract from the server by cid.
const res = await client.witness.read(wid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const statement = res.data.witness
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/witness/read.ts) using the shell command:  
> `yarn load demo/api/witness/read`

**Example Response**

- [JSON Data](../examples/witness_data.md)

**Related Interfaces:**

- [WitnessData](../data/witness.md#witnessdata)
