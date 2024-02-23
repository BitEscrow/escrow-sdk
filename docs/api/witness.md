# Witness API

Reference guide for the BitEscrow Witness API. Click on the links below to navigate:

| Endpoint | Description |
|----------|-------------|
| [/api/witness/:wid](#read-a-statement-by-id) | Fetch a witness statement from the server by id (wid). |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Read a Statement By Id

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

**Related Interfaces:**

- [WitnessData](../data/witness.md#witnessdata)
