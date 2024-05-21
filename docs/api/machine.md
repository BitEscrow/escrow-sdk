# Machine API

Reference guide for the virtual machine API. Click on the links below to navigate:

| Endpoint | Description |
|----------|-------------|
| [/api/machine/list](#list-machines-by-pubkey)        | Fetch a list of machines associated to your public key. |
| [/api/machine/:vmid](#read-a-machine-by-vmid)        | Fetch the current state of a machine, by vmid. |
| [/api/machine/:vmid/commits](#read-a-contract-by-id) | Fetch a list of statements commited to a machine, by vmid. |
| [/api/machine/:vmid/submit](#read-a-contract-by-id)  | Submit a new statement to a machine, by vmid. |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## List Machines By Pubkey

Request a list of machines that are endorsed by the token's pubkey.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/machine/list'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(contract_request)
```

**Request Body**

```ts
interface ContractRequest {
  members     : MemberData[]
  proposal    : ProposalData
  signatures ?: string[]
}
```

**Response Interface**

```ts
interface ContractDataResponse {
  data : {
    contract : ContractData
  }
}
```

**Example Request**

```ts
// Deliver proposal and endorsements to server.
const res = await client.contract.create(draft)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our published contract.
const new_contract = res.data.contract
```

**Related Interfaces**

- [MachineData](../data/machine.md#machinedata)

---

## Read a Machine By ID

Fetch a contract from the server by its contract id (cid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/machine/:vmid'
```

**Response Interface**

```ts
export interface VMDataResponse {
  data : {
    machine : MachineData
  }
}
```

**Example Request**

```ts
// Define the contract id we will use.
const cid = new_contract.cid
// Fetch a contract from the server by cid.
const res = await client.contract.read(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const contract = res.data.contract
```

**Example Response**

- [JSON Data](../examples/contract_data.md)

**Related Interfaces**

- [ContractData](../data/contract.md#contractdata)

---

## List Statements in a Machine

Request all commited statements for a virtual machine.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/machine/:vmid/commits'
```

**Response Interface**

```ts
interface WitnessListResponse {
  data : {
    statements : WitnessReceipt[]
  }
}
```

**Example Request**

```ts
// Fetch a contract from the server by cid.
const res = await client.contract.witness(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const statements = res.data.statements
```

**Related Interfaces:**

- [WitnessReceipt](../data/witness.md#witnessreceipt)

---

## Submit a Witness Statement

Submit a witness statement to the contract VM.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/machine/:vmid/submit'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(witness_request)
```

**Request Body**

```ts
interface WitnessRequest {
  witness : WitnessData
}
```

**Response Interface**

```ts
export interface VMSubmitResponse {
  data : {
    machine   : MachineData
    statement : WitnessReceipt
  }
}

```

**Example Request**

```ts
// Initialize a variable for our witness data.
let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.sign(active_contract, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(active_contract, witness)
// Define the contract id we will use.
const cid = active_contract.cid
// Submit the signed statement to the server.
const res = await client.contract.submit(cid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the contract from the response.
const updated_contract = res.data.contract
```

**Related Interfaces:**

- [MachineData](../data/machine.md#machinedata)
- [WitnessData](../data/witness.md#witnessdata)
