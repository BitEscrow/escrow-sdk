# Contracts

Work in progreess. Check back later!

**Sections**

1. [Creating a Contract](#creating-a-contract)
2. [Funding a Contract](#funding-a-contract)
3. [Contract Activation](#contract-activation)
4. [Virtual Machine (CVM)](#contract-virtual-machine-cvm)
4. [Submitting Statements](#submitting-statements)
5. [Contract Settlement](#contract-settlement)
6. [Contract Expiration](#contract-expiration)

**Interfaces**

- [ContractRequest]()
- [ContractData]()
- [ContractStatus]()
- [WitnessTemplate]()
- [WitnessData]()
- [MachineState]()

## Creating a Contract

## Funding a Contract

## Contract Activation

## Contract Virtual Machine (CVM)

## Submitting Statements

## Contract Settlement

* Validating execution
* sweeping funds

## Contract Expiration

```ts
interface ContractRequest {
  proposal    : ProposalData
  signatures ?: string[]
}

type SpendTemplate = [ label : string, txhex : string ]

interface ContractData {
  activated   : null | number
  agent_fee   : PaymentEntry
  agent_id    : string
  agent_pk    : string
  agent_pn    : string
  balance     : number
  cid         : string
  deadline    : number
  est_txfee   : number
  est_txsize  : number
  expires_at  : null | number
  feerate     : number
  moderator   : string | null
  outputs     : SpendTemplate[]
  pending     : number
  pubkeys     : string[]
  prop_id     : string
  published   : number
  settled     : boolean
  settled_at  : number | null
  signatures  : string[]
  spent       : boolean,
  spent_at    : number | null
  spent_txid  : string | null
  status      : ContractStatus
  subtotal    : number
  terms       : ProposalData
  total       : number
  updated_at  : number
  vm_state    : null | StateData
  vout_size   : number
}

export type ContractStatus = 
  'published' | 
  'funded'    | 
  'secured'   | 
  'pending'   | 
  'active'    |
  'closed'    | 
  'spent'     | 
  'settled'   | 
  'canceled'  | 
  'expired'   | 
  'error'

interface WitnessTemplate {
  action : string
  args  ?: Literal[]
  method : string
  path   : string
  stamp ?: number
}

interface WitnessData {
  action  : string
  args    : Literal[]
  method  : string
  path    : string
  prog_id : string
  sigs    : string[]
  stamp   : number
  wid     : string
}
```
