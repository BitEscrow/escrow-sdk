# Deposit API

Reference guide for the BitEscrow Deposit API. Click on the links below to navigate:

| Endpoint | Description |
|----------|-------------|
| [/api/deposit/list/:pubkey](#list-deposits-by-pubkey) | Request a list of deposits indexed by your pubkey. |
| [/api/deposit/:dpid](#read-a-deposit-by-id) | Fetch a deposit from the server by id (dpid). |
| [/api/deposit/:dpid/lock](#lock-funds-to-a-contract) | Commit funds in an open deposit to a contract. |
| [/api/deposit/:dpid/cancel](#close-a-deposit) | Close an account and return funds to the registered xpub. |
| [/api/deposit/:dpid/close](#close-a-deposit) | Close an account and return funds to the registered xpub. |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## List Deposits By Pubkey

Request a list of deposits indexed by your pubkey.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/deposit/:pubkey'
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
import { client }  from '@scrow/demo/01_create_client.js'
import { signers } from '@scrow/demo/02_create_signer.js'

// Define our funder for the deposit.
const depositor = signers[0]
// Generate a request token.
const req = depositor.request.deposit_list()
// Deliver the request and token.
const res = await client.deposit.list(depositor.pubkey, req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const deposits = res.data.deposits
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/deposit/list.ts) using the shell command:  
> `yarn load demo/api/deposit/list`

**Example Response**

- [JSON Data](../examples/deposit_list.md)

**Related Interfaces:**

- [DepositData](../data/deposit.md#depositdata)

---

## Read a Deposit By DPID

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
import { client }         from '@scrow/demo/01_create_client.js'
import { locked_deposit } from '@scrow/demo/07_deposit_funds.js'

// Define the deposit id we will use.
const dpid = locked_deposit.dpid
// Request to read a deposit via dpid.
const res = await client.deposit.read(dpid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data response
const deposit = res.data.deposit
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/deposit/read.ts) using the shell command:  
> `yarn load demo/api/deposit/read`

**Example Response**

- [JSON Data](../examples/deposit_data.md)

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
import { client }       from '@scrow/demo/01_create_client.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'
import { signers }      from '@scrow/demo/02_create_signer.js'
import { open_deposit } from '@scrow/demo/api/deposit/register.js'

// Define our funder for the deposit.
const depositor = signers[0]
// Define the dpid for the deposit we are using.
const dpid = open_deposit.dpid
// Generate a lock request from the depositor.
const req = depositor.account.lock(new_contract, open_deposit)
// Deliver the request and token.
const res = await client.deposit.lock(dpid, req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const { contract, deposit } = res.data
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/deposit/lock.ts) using the shell command:  
> `yarn load demo/api/deposit/lock`

**Example Response**

- [JSON Data](../examples/deposit_commit.md)

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)
- [CovenantData](../data/deposit.md#covenantdata)
- [DepositData](../data/deposit.md#depositdata)

---

## Cancel a Deposit

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
import { client }       from '@scrow/demo/01_create_client.js'
import { signers }      from '@scrow/demo/02_create_signer.js'
import { open_deposit } from '@scrow/demo/api/deposit/register.js'

// Define our funder for the deposit.
const depositor = signers[0]
// Define the dpid for the deposit we are using.
const dpid = open_deposit.dpid
// Define a txfee for the close transaction.
const txfee = 1000
// Generate a lock request from the depositor.
const close_req = depositor.account.close(open_deposit, txfee)
// Deliver the request and token.
const res = await client.deposit.close(dpid, close_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const closed_deposit = res.data.deposit
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/deposit/close.ts) using the shell command:  
> `yarn load demo/api/deposit/close`

**Example Response**

- [JSON Data](../examples/deposit_closed.md)

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
import { client }       from '@scrow/demo/01_create_client.js'
import { signers }      from '@scrow/demo/02_create_signer.js'
import { open_deposit } from '@scrow/demo/api/deposit/register.js'

// Define our funder for the deposit.
const depositor = signers[0]
// Define the dpid for the deposit we are using.
const dpid = open_deposit.dpid
// Define a txfee for the close transaction.
const txfee = 1000
// Generate a lock request from the depositor.
const close_req = depositor.account.close(open_deposit, txfee)
// Deliver the request and token.
const res = await client.deposit.close(dpid, close_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our response data.
const closed_deposit = res.data.deposit
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/deposit/close.ts) using the shell command:  
> `yarn load demo/api/deposit/close`

**Example Response**

- [JSON Data](../examples/deposit_closed.md)

**Related Interfaces:**

- [DepositData](../data/deposit.md#depositdata)
