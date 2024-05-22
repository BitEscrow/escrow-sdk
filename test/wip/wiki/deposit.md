# Deposit Wiki

A deposit is a multi-signature account that holds a Bitcoin `utxo`. It is used for negotiating funds for a contract.

**Sections**

1. [Requesting an Account](#requesting-an-account)
2. [Depositing Funds](#depositing-funds)
3. [Registering Funds](#registering-funds)
3. [Lock a Deposit](#lock-a-deposit)
4. [Close a Deposit](#closing-an-account)

**Interfaces**

- [Deposit Interfaces](../data/deposit.md)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Requesting an Account

Before a user can deposit funds, they must request a deposit account from the escrow server. The client can solicit an account request from the user's signing device.

```ts
// Create a client and signer for demonstration.
const client = new EscrowClient(config)
const signer = EscrowSigner.generate(config)

// Define our deposit locktime.
const locktime = 60 * 60  // 1 hour locktime

// Create an account request from the signer.
const acct_req = signer.account.create(locktime)
```

The account request from the signer will look like this:

```ts
interface AccountRequest {
  deposit_pk : string  // The public key of the depositor.
  locktime  ?: number  // The requested locktime.
  spend_xpub : string  // The xpub to use for generating addresses.
}
```

We can submit this request to the server to get a `DepositAccount`:

```ts
// Submit the account request to the server
const acct_res = await client.deposit.request(acct_req)

// Check the response is valid.
if (!acct_res.ok) throw new Error(acct_res.error)

const { account } = acct_res.data
```

If the request is successful, the client will receive an account in response:

```ts
interface DepositAccount {
  acct_id    : string  // Hash identifer for the account record.
  acct_sig   : string  // Signature for the account record.
  address    : string  // On-chain address for receiving funds.
  agent_id   : string  // Identifier of the deposit agent.
  agent_pk   : string  // Public key of the deposit agent.
  created_at : number  // Account creation timestamp (in seconds).
  deposit_pk : string  // Public key of the funder making the deposit.
  sequence   : number  // Locktime converted into a sequence value.
  spend_xpub : string  // The extended key used for returning funds.
}
```

The `DepositAccount` should be verified by the user before any funds are sent:

```ts
// Generate an account request from the signer.
const is_valid = signer.account.verify(account)
```

> Note: To avoid a main-in-the-middle attack (MITM), the signer should make sure their `EscrowSigner` is configured with a `host_pubkey`, which allows the signer to check the signature on the `DepositAccount`.

## Depositing Funds

To deposit funds, simply send money to the `address` specified in the `DepositAccount`.

Once the transaction for the funds has hit the mempool, you can use the `OracleAPI` to fetch the `utxo`:

```ts
/**
 * An example while loop for polling a bitcoin address.
 */ 
const [ ival, retries ] = poll

let tries = 1,
    utxos = await client.oracle.get_address_utxos(address)

// While there are no utxos (and we still have tries):
while (utxos.length === 0 && tries < retries) {
  // Print current status to console.
  console.log(`[${tries}/${retries}] checking address in ${ival} seconds...`)
  // Sleep for interval number of secords.
  await sleep(ival * 1000)
  // Check again for utxos at address.
  utxos = await client.oracle.get_address_utxos(address)
  // Increment our tries counter
  tries += 1
}
// If we still have no utxos, throw error.
if (utxos.length === 0) throw new Error('utxo not found')
```

Once you have your `utxo` data from the oracle, you can move onto the next step.

## Registering Funds

Before we can spend our freshly deposited `utxo`, we have to register it with the server.

A registration request looks like this:

```ts
interface RegisterRequest {
  covenant    ?: CovenantData  // Provide a covenant to lock the deposit
  deposit_pk   : string        // Public key of the depositor.
  sequence     : number        // Sequence value for the account.
  spend_xpub   : string        // Spending xpub for the account.
  utxo         : TxOutput      // The utxo being registered.
}
```

There are two ways to register a `utxo`: _with_ or _without_ a covenant. 

A covenant is what locks your funds to a contract. It is a bundle of partial signatures that authroizes the spending paths in a contract.

```ts
interface CovenantData {
  cid    : string
  pnonce : string
  psigs  : [ label : string, psig : string ][]
}
```

**Register a Deposit (with covenant)**

This is the typical scenario. We are submitting a covenant with our registration, so the funds are locked to a contract.

```ts
// Request the funders device to sign a covenant.
const covenant  = signer.account.commit_utxo(account, contract, utxo)
// Build our registration request.
const reg_req   = { covenant, deposit_pk, sequence, spend_xpub, utxo }
// Deliver our registration request to the server.
const res = await client.deposit.fund(reg_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
```

This is the fastest method for depositing funds into a contract.

**Register a Deposit (no covenant)**

If you wish to register your deposit utxo without a covenant:

```ts
const reg_req = { deposit_pk, sequence, spend_xpub, utxo }
// Deliver our registration request to the server.
const res = await client.deposit.register(reg_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
```

This method is useful for confirming your deposit ahead of time, so that future covenants are applied immediately.

## Lock a Deposit

If you have an existing deposit that is already registered, and you want to lock it to a contract:

```ts
// Request the funders device to sign a covenant.
const covenant  = signer.account.commit_deposit(contract, deposit)
// Deliver our covenant to the server.
const res = await client.deposit.commit(deposit.dpid, covenant)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
```

If a contract is canceled, and deposits are released, you can use this process to re-use your deposit for another contract.

## Closing a Deposit

API Reference : [Close a Deposit](../api/deposit.md#close-a-deposit)

If you have an open deposit, you can close it and return the funds to your registered xpub.

To close a deposit, the user's device creates a `CloseRequest` and delivers it to the escrow server:

```ts
// Close demo code here.
```
