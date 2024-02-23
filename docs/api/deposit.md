# Deposit API

Reference guide for the BitEscrow Deposit API. Click on the links below to navigate:

| Endpoint | Description |
|----------|-------------|
| [/api/deposit/request](#request-a-deposit-account) | Request a new deposit address from the escrow server. |
| [/api/deposit/register](#register-a-deposit) | Register a utxo sent to a deposit address. |
| [/api/deposit/commit](#commit-to-a-contract) | Register and commit a utxo to a published contract. |
| [/api/deposit/list/:pubkey](#list-deposits-by-pubkey) | Request a list of deposits indexed by your pubkey. |
| [/api/deposit/:dpid](#read-a-deposit-by-id) | Fetch a deposit from the server by id (dpid). |
| [/api/deposit/:dpid/digest](#read-a-deposit-digest) | Fetch a more compact form of a deposit (for polling). |
| [/api/deposit/:dpid/lock](#lock-funds-to-a-contract) | Commit funds in an open deposit to a contract. |
| [/api/deposit/:dpid/status](#read-a-deposit-status) | Fetch a deposit's current status. |
| [/api/deposit/:dpid/close](#close-a-deposit) | Close an account and return funds to the registered xpub. |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Request a Deposit Account

Request a new deposit address from the escrow server.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/request'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(account_request)
```

**Request Body**

```ts
interface AccountRequest {
  deposit_pk : string  // Public key of the funder making the deposit.
  locktime  ?: number  // Desired locktime (in seconds) for the deposit.
  spend_xpub : string  // The extended key used for returning funds.
}
```

**Response Interface**

```ts
interface AccountDataResponse {
  data : {
    account : DepositAccount
  }
}
```

**Example Request**

```ts
import { client }  from '@scrow/demo/01_create_client.js'
import { signers } from '@scrow/demo/02_create_signer.js'

// Define our funder for the deposit.
export const depositor = signers[0]
// Define our deposit locktime.
const locktime  = 60 * 60  // 1 hour locktime
// Get an account request from the funder device.
const acct_req  = depositor.account.create(locktime)
// Submit the account request to the server
const acct_res = await client.deposit.request(acct_req)
// Check the response is valid.
if (!acct_res.ok) throw new Error(acct_res.error)
// Unpack our data response.
const new_account = acct_res.data.account
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/deposit/request.ts) using the shell command:  
> `yarn load demo/api/deposit/request`

**Example Response**

- [JSON Data](../examples/deposit_account.md)

**Related Interfaces:**

- [DepositAccount](../data/deposit.md#depositaccount)

---

## Register a Deposit

Register a utxo sent to a deposit address.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/register'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(register_request)
```

**Request Body**

```ts
interface RegisterRequest {
  deposit_pk  : string    // Public key of the funder making the deposit.
  return_psig : string    // Pre-authorization for returning the deposit.
  sequence    : number    // Locktime converted into a sequence value.
  spend_xpub  : string    // The extended key used for returning funds.
  utxo        : TxOutput  // The unspent output to register as a deposit.
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
import { config }       from '@scrow/demo/00_demo_config.js'
import { client }       from '@scrow/demo/01_create_client.js'
import { new_account }  from '@scrow/demo/06_request_account.js'

// Unpack account details.
const { address, deposit_pk, sequence, spend_xpub } = new_account
// Define our polling interval and retries.
const [ ival, retries ] = config.poll
// Poll for utxos from the account address.
const utxos = await client.oracle.poll_address(address, ival, retries, true)
// Get the output data from the utxo.
const utxo  = utxos[0].txspend
// Create a registration request.
const req = { deposit_pk, sequence, spend_xpub, utxo }
// Deliver our registration request to the server.
const res = await client.deposit.register(reg_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data object.
const open_deposit = res.data.deposit
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/deposit/register.ts) using the shell command:  
> `yarn load demo/api/deposit/register`

**Example Response**

- [JSON Data](../examples/deposit_data.md)

**Related Interfaces:**

- [DepositData](../data/deposit.md#depositdata)
- [TxOutput](../data/oracle.md#txoutput)

---

## Commit to a Contract

Register and commit a utxo to a published contract.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/commit'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(commit_request)
```

**Request Body**

```ts
interface CommitRequest extends RegisterRequest {
  covenant    : CovenantData  // Covenant that locks the UTXO.
  deposit_pk  : string        // Public key of the funder making the deposit.
  return_psig : string        // Pre-authorization for returning the deposit.
  sequence    : number        // Locktime converted into a sequence value.
  spend_xpub  : string        // The extended key used for returning funds.
  utxo        : TxOutput      // The unspent output to register as a deposit.
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
import { config }       from '@scrow/demo/00_demo_config.js'
import { client }       from '@scrow/demo/01_create_client.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'
import { new_account }  from '@scrow/demo/06_request_account.js'

// Define our polling interval and retries.
const [ ival, retries ] = config.poll
// Poll for utxos from the account address.
const utxos = await client.oracle.poll_address(address, ival, retries, true)
// Get the output data from the utxo.
const utxo  = utxos[0].txspend
// Generate a commit request from the depositor.
const req = depositor.account.commit(new_account, new_contract, utxo)
// Deliver our commit request to the server.
const res = await client.deposit.commit(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data object.
const locked_deposit = res.data.deposit
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/deposit/commit.ts) using the shell command:  
> `yarn load demo/api/deposit/commit`

**Example Response**

- [JSON Data](../examples/deposit_commit.md)

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)
- [CovenantData](../data/deposit.md#covenantdata)
- [DepositData](../data/deposit.md#depositdata)
- [TxOutput](../data/oracle.md#txoutput)

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

## Read a Deposit Status

Fetch a deposit's current status.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/deposit/:dpid/status'
```

**Response Interface**

```ts
export interface DepositStatusResponse {
  data: {
    deposit : {
      status     : DepositStatus
      updated_at : number
    }
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
const res = await client.deposit.status(dpid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data response
const deposit = res.data.deposit
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/deposit/status.ts) using the shell command:  
> `yarn load demo/api/deposit/status`

**Example Response**

- [JSON Data](../examples/deposit_status.md)

**Related Interfaces:**

- [DepositStatus](../data/deposit.md#depositstatus)

---

## Read a Deposit Digest

Fetch a more compact form of a deposit (for polling).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/deposit/:dpid/digest'
```

**Response Interface**

```ts
interface DepositDigestResponse {
  data : {
    deposit : DepositDigest
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
const res = await client.deposit.digest(dpid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data response
const deposit = res.data.deposit
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/deposit/digest.ts) using the shell command:  
> `yarn load demo/api/deposit/digest`

**Example Response**

- [JSON Data](../examples/deposit_digest.md)
**Related Interfaces:**

- [DepositDigest](../data/deposit.md#depositdigest)

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
