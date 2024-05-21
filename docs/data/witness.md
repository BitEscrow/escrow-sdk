# Witness Interfaces

List of interfaces for the Witness API. Click on the links below to navigate:

- [WitnessTemplate](#witnesstemplate)
- [WitnessData](#witnessdata)
- [WitnessReceipt](#witnessreceipt)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## WitnessTemplate

A template interface, used when creating a new witness statement.

```ts
interface WitnessTemplate {
  action   : string    // The instruction to execute.
  args    ?: Literal[] // A list of arguments for the method.
  content ?: string    // Additional user-specified content.
  method   : string    // The method to use for evaluation.
  path     : string    // The spending path to select (if applicable).
  stamp   ?: number    // The UTC timestamp for the statement.
}
```

## WitnessData

A signed statement that is ready to be input into the virtual machine.

```ts
interface WitnessData {
  action   : string    // The instruction to execute.
  args    ?: Literal[] // A list of arguments for the method.
  content ?: string    // Additional user-specified content.
  method   : string    // The method to use for evaluation.
  path     : string    // The spending path to select (if applicable).
  prog_id  : string    // The unique identifier of the program to use.
  sigs     : string[]  // A list of signatures endorsing the statement.
  stamp    : number    // The UTC timestamp for the statement.
  vmid     : string    // Hash identifier of the machine to use.
  wid      : string    // Hash identifier of the statement (for signing).
}
```

## WitnessReceipt

The `WitnessData` object is stored and returned with a signed receipt attached.

```ts
interface WitnessReceipt extends WitnessData {
  receipt_at  : number       // UTC timestamp for when the receipt was created. 
  receipt_id  : string        // Hash identifier for the receipt. 
  server_pk   : string        // The public key being used by the escrow server.
  server_sig  : string        // A confirmation signature from the escrow server.
  vm_closed   : boolean       // The result state of the virtual machine.
  vm_hash     : string        // The result head of the hash-chain in the machine.
  vm_output   : string | null // The result output of the machine.
  vm_step     : number        // The result execution step of the machine.
}
```