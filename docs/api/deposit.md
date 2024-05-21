# Deposit API

Reference guide for the BitEscrow Deposit API. Click on the links below to navigate:

| Endpoint | Description |
|----------|-------------|
| [/api/deposit/list](#list-deposits-by-pubkey)        | Request a list of deposits indexed by your pubkey. |
| [/api/deposit/:dpid](#read-a-deposit-by-id)          | Fetch a deposit from the server by id (dpid). |
| [/api/deposit/:dpid/lock](#lock-funds-to-a-contract) | Commit funds in an open deposit to a contract. |
| [/api/deposit/:dpid/cancel](#close-a-deposit)        | Close an account and return funds to the registered xpub. |
| [/api/deposit/:dpid/close](#close-a-deposit)         | Close an account and return funds to the registered xpub. |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## List Deposits By Pubkey

Request a list of deposits that are endorsed by the token's pubkey.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/deposit/list'
headers  : { 'Authorization' : 'Token ' + auth_token }
```

**Response Interface**

```ts
interface DepositListResponse {
  data : {
    deposits : DepositData[]
  }
}
```

**Example Request**

```ts
// Generate a request token.
const req = signer.deposit.list()
// Deliver the request and token.
const res = await client.deposit.list(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const { deposits } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/deposit/list.ts).

**Related Interfaces:**

- [DepositData](../data/deposit.md#depositdata)

---

## Read a Deposit By Id

Fetch a deposit from the server by id (dpid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/deposit/:dpid'
```

**Response Interface**

```ts
interface DepositDataResponse {
  data : {
    deposit : DepositData
  }
}
```

**Example Request**

```ts
// Request to read a deposit via dpid.
const res = await client.deposit.read(dpid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data response
const { deposit } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/deposit/read.ts).

**Example Response**

- [DepositData](../examples/depositdata.md)

**Related Interfaces:**

- [DepositData](../data/deposit.md#depositdata)

---

## Lock Funds to a Contract

Commit funds in an open deposit to a contract.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/:dpid/lock'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(lock_request)
```

**Request Body**

```ts
interface LockRequest {
  covenant : CovenantData  // Covenant that locks the UTXO.
}
```

**Response Interface**

```ts
interface FundDataResponse {
  data : {
    contract : ContractData
    deposit  : DepositData
  }
}
```

**Example Request**

```ts
// Generate a lock request from the depositor.
const req = signer.deposit.lock(new_contract, open_deposit)
// Deliver the request and token.
const res = await client.deposit.lock(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const { contract, deposit } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/deposit/lock.ts).

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)
- [CovenantData](../data/deposit.md#covenantdata)
- [DepositData](../data/deposit.md#depositdata)

---

## Cancel a Deposit

Close an account and return funds to the registered xpub.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/deposit/:dpid/cancel'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(close_request)
```

**Response Interface**

```ts
interface DepositDataResponse {
  data : {
    deposit : DepositData
  }
}
```

**Example Request**

```ts
// Generate a close request from the depositor.
const req = signer.deposit.cancel(dpid)
// Deliver the request and token.
const res = await client.deposit.cancel(dpid, req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const { deposit } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/deposit/cancel.ts).

**Example Response**

- [DepositData](../examples/depositdata.md)

**Related Interfaces:**

- [DepositData](../data/deposit.md#depositdata)

---

## Close a Deposit

Close an account and return funds to the registered xpub.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/:dpid/close'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(close_request)
```

**Request Body**

```ts
export interface CloseRequest {
  pnonce : string  // The publice nonce used for signing.
  psig   : string  // The partial signature for spending.
  txfee  : number  // The transaction fee used in the tx.
}
```

**Response Interface**

```ts
interface DepositDataResponse {
  data : {
    deposit : DepositData
  }
}
```

**Example Request**

```ts
// Generate a close request from the depositor.
const req = signer.deposit.close(open_deposit, return_rate)
// Deliver the request and token.
const res = await client.deposit.close(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const { deposit } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/deposit/close.ts).

**Example Response**

- [DepositData](../examples/depositdata.md)

**Related Interfaces:**

- [DepositData](../data/deposit.md#depositdata)
