# Account API

Reference guide for the Escrow Account API. Click on the links below to navigate:

| Endpoint | Description |
|----------|-------------|
| [/api/account/request](#request-a-deposit-account) | Request a new deposit account from the escrow server. |
| [/api/account/register](#register-a-deposit-utxo)  | Register a deposit (utxo) with the escrow server. |
| [/api/account/commit](#commit-a-deposit-utxo)      | Register a deposit and secure it to a contract. |

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
// Get an account request from the funder device.
const req = signer.account.request(locktime, return_addr)
// Submit the account request to the server
const res = await client.account.request(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data response.
const { account } = res.data
```

> See the full code example [here](https://github.com/BitEscrow/escrow-core/tree/master/demo/api/account/request.ts).

**Example Response**

- [AccountData](../examples/account.md)

**Related Interfaces:**

- [AccountData](../data/account.md#accountdata)

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
  agent_tkn   : string        // The server token to use when creating a covenant.
  deposit_pk  : string        // Public key belonging the user making the deposit.
  locktime    : number        // Desired locktime (in seconds) for account recovery.
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

- [DepositData](../examples/depositdata.md)

**Related Interfaces:**

- [DepositData](../data/deposit.md#depositdata)
- [TxOutput](../data/deposit.md#txoutput)

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

- [ContractData](../examples/contractdata.md)
- [DepositData](../examples/depositdata.md)

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)
- [CovenantData](../data/deposit.md#covenantdata)
- [DepositData](../data/deposit.md#depositdata)
- [TxOutput](../data/oracle.md#txoutput)
