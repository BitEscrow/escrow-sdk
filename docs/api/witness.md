# Witness API

Reference guide for the BitEscrow Witness API.

> Click on the links below to navigate:

[`/api/witness/:wid`](#read-a-statement-by-id)  

## Read a Statement By Id

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
