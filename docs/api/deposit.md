# Deposit API

Reference guide for the BitEscrow Deposit API.

| Endpoint | Description |
|----------|-------------|
| [/api/deposit/list](#list-deposits-by-pubkey)    | List deposits by pubkey.           |
| [/api/deposit/lock](#lock-deposit-to-a-contract) | Lock a deposit to a contract.      |
| [/api/deposit/close](#close-a-deposit)           | Close a deposit and return funds.  |
| [/api/deposit/:dpid](#read-a-deposit-by-id)      | Fetch a deposit via ID.            |
| [/api/deposit/:dpid/cancel](#cancel-a-deposit)   | Cancel a deposit and return funds. |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## List Deposits By Pubkey

Request a list of deposits linked to the token's pubkey.

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

- [DepositData](../data/deposit.md#deposit-data)

---

## Read a Deposit By Id

Fetch a deposit from the server by its identifier (dpid).

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

- [DepositData](../examples/DepositData.md)

**Related Interfaces:**

- [DepositData](../data/deposit.md#deposit-data)

---

## Lock Deposit to a Contract

Lock a deposit to a specific contract.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/lock'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(lock_request)
```

**Request Body**

```ts
interface LockRequest {
  dpid     : string
  covenant : CovenantData
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

- [ContractData](../data/contract.md#contract-data)
- [CovenantData](../data/deposit.md#covenant-data)
- [DepositData](../data/deposit.md#deposit-data)

---

## Close a Deposit

Close a deposit and return the funds (with an updated feerate).

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/close'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(close_request)
```

**Request Body**

```ts
export interface CloseRequest {
  dpid        : string
  return_rate : number
  return_psig : string
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

- [DepositData](../examples/DepositData.md)

**Related Interfaces:**

- [DepositData](../data/deposit.md#deposit-data)

---

## Cancel a Deposit

Cancel a deposit and return the funds.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/deposit/:dpid/cancel'
headers  : { 'Authorization' : 'Token ' + auth_token }
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

- [DepositData](../examples/DepositData.md)

**Related Interfaces:**

- [DepositData](../data/deposit.md#deposit-data)
