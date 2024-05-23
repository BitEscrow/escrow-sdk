# Account API

Reference guide for the Escrow Account API.

| Endpoint | Description |
|----------|-------------|
| [/api/account/request](#request-a-deposit-account) | Request a new deposit account. |
| [/api/account/register](#register-a-deposit)       | Register a deposit of funds.   |
| [/api/account/commit](#commit-a-deposit)           | Register funds for a contract. |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Request a Deposit Account

Request a new deposit account from the escrow server.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/account/request'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(account_request)
```

**Request Body**

```ts
interface AccountRequest {
  deposit_pk  : string       // Public key belonging the user making the deposit.
  locktime   ?: number       // Desired locktime (in seconds) for account recovery.
  network     : ChainNetwork // The block-chain network to use.
  return_addr : string       // The return address to use when closing the deposit.
}
```

**Response Interface**

```ts
interface AccountDataResponse {
  data : {
    account : AccountData
  }
}
```

**Example Request**

```ts
// Get an account request from the signing device.
const req = signer.account.request(locktime, return_addr)
// Submit the request to the server.
const res = await client.account.request(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the response data.
const { account } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/account/request.ts).

**Example Response**

- [AccountData](../examples/AccountData.md)

**Related Interfaces:**

- [AccountData](../data/account.md#account-data)

---

## Register a Deposit

Register a utxo that has been sent to a deposit address.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/account/register'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(register_request)
```

**Request Body**

```ts
interface RegisterRequest {
  agent_tkn   : string        // The agent token provided by the server.
  deposit_pk  : string        // Public key belonging the funder's signing device.
  locktime    : number        // Desired locktime (in seconds) to hold funds in escrow.
  network     : ChainNetwork  // The block-chain network to use.
  return_addr : string        // The return address to use when closing the deposit.
  return_psig : string        // Pre-authorization for returning the deposit.
  return_rate : number        // The transaction fee amount to use when closing the deposit.
  utxo        : TxOutput      // The unspent output to register as a deposit.
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
// Create a registration request.
const req = signer.account.register(new_account, return_rate, utxo)
// Deliver our registration request to the server.
const res = await client.account.register(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data object.
const { deposit } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/account/register.ts).

**Example Response**

- [DepositData](../examples/DepositData.md)

**Related Interfaces:**

- [DepositData](../data/deposit.md#deposit-data)
- [TxOutput](../data/oracle.md#tx-output)

---

## Commit a Deposit

Register and commit a utxo to a published contract.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/account/commit'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(commit_request)
```

**Request Body**

```ts
interface CommitRequest extends RegisterRequest {
  ...RegisterRequest
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
// Generate a commit request from the depositor.
const req = signer.account.commit(new_account, new_contract, return_rate, utxo)
// Deliver our commit request to the server.
const res = await client.account.commit(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data object.
const { contract, deposit } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/account/commit.ts).

**Example Response**

- [ContractData](../examples/ContractData.md)
- [DepositData](../examples/DepositData.md)

**Related Interfaces:**

- [ContractData](../data/contract.md#contract-data)
- [CovenantData](../data/deposit.md#covenant-data)
- [DepositData](../data/deposit.md#deposit-data)
- [TxOutput](../data/oracle.md#tx-output)
