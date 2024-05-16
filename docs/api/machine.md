# Virtual Machine API

Reference guide for the Virtual Machine API. Click on the links below to navigate:

| Endpoint | Description |
|----------|-------------|
| [/api/vm/list](#list-machines-by-pubkey)        | Fetch a list of machines associated to your public key. |
| [/api/vm/:vmid](#read-a-machine-by-vmid)        | Fetch the current state of a machine, by vmid. |
| [/api/vm/:vmid/commits](#read-a-contract-by-id) | Fetch a list of statements commited to a machine, by vmid. |
| [/api/vm/:vmid/submit](#read-a-contract-by-id)  | Submit a new statement to a machine, by vmid. |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## List Machines By Pubkey

Create a new contract on the escrow server.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/vm/list'
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
import { client } from '@scrow/demo/01_create_client.js'
import { draft }  from '@scrow/demo/04_finish_draft.js'

// Deliver proposal and endorsements to server.
const res = await client.contract.create(draft)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our published contract.
const new_contract = res.data.contract
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/contract/create.ts) using the shell command:  
> `yarn load demo/api/contract/create`

**Example Response**

- [JSON Data](../examples/contract_data.md)

**Related Interfaces**

- [ProposalData](../data/draft.md#proposaldata)
- [ContractData](../data/contract.md#contractdata)

---

## Read a Machine By VMID

Fetch a contract from the server by its contract id (cid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid'
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
import { client }       from '@scrow/demo/01_create_client.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'

// Define the contract id we will use.
const cid = new_contract.cid
// Fetch a contract from the server by cid.
const res = await client.contract.read(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const contract = res.data.contract
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/contract/read.ts) using the shell command:  
> `yarn load demo/api/contract/read`

**Example Response**

- [JSON Data](../examples/contract_data.md)

**Related Interfaces**

- [ContractData](../data/contract.md#contractdata)

---

## Submit a Witness Statement

Submit a witness statement to the contract VM.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/contract/:cid/submit'
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
interface ContractDataResponse {
  data : {
    contract : ContractData
  }
}
```

**Example Request**

```ts
import { client }          from '@scrow/demo/01_create_client.js'
import { signers }         from '@scrow/demo/02_create_signer.js'
import { active_contract } from '@scrow/demo/08_check_contract.js'

// Unpack our list of signers.
const [ a_signer, b_signer ] = signers
// Create a statement template.
const template = {
  action : 'close',
  method : 'endorse',
  path   : 'tails'
}
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

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/contract/submit.ts) using the shell command:  
> `yarn load demo/api/contract/submit`

**Example Response**

- [JSON Data](../examples/contract_active.md)

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)
- [WitnessData](../data/witness.md#witnessdata)

---

## Read a Contract VM State

Fetch a contract's machine state via the contract id (cid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/vmstate'
```

**Response Interface**

```ts
interface ContractVMStateResponse {
  data : {
    status     : ContractStatus
    updated_at : number
    vm_state   : StateData
  }
}
```

**Example Request**

```ts
import { client }          from '@scrow/demo/01_create_client.js'
import { active_contract } from '@scrow/demo/08_check_contract.js'

// Define the contract id we will use.
const cid = active_contract.cid
// Fetch a contract's vm state from the server via cid.
const res = await client.contract.vmstate(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const vm_state = res.data.vm_state
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/contract/vmstate.ts) using the shell command:  
> `yarn load demo/api/contract/vmstate`

**Example Response**

- [JSON Data](../examples/contract_vm.md)

**Related Interfaces**

- [ContractStatus](../data/contract.md#contractstatus)
- [StateData](../data/contract.md#statedata)

---

## List Statements in a Contract

Request all recorded witness statements for a contract.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/witness'
```

**Response Interface**

```ts
interface WitnessListResponse {
  data : {
    statements : WitnessData[]
  }
}
```

**Example Request**

```ts
import { client }           from '@scrow/demo/01_create_client.js'
import { settled_contract } from '@scrow/demo/09_settle_contract.js'

// Define the contract id we will use.
const cid = settled_contract.cid
// Fetch a contract from the server by cid.
const res = await client.contract.witness(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const statements = res.data.statements
```

> You can run this code in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/contract/witness.ts) using the shell command:  
> `yarn load demo/api/contract/witness`

**Example Response**

- [JSON Data](../examples/witness_list.md)

**Related Interfaces:**

- [WitnessData](../data/witness.md#witnessdata)
