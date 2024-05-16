# Machine Interfaces

List of interfaces for the ScriptEngine API. Click on the links below to navigate:

- [ProgramData](#programdata)
- [MachineConfig](#machineconfig)
- [MachineData](#machinedata)
- [ScriptEngineAPI](#scriptengine-api)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## ProgramData

Describes a program in the virtual machine.

```ts
interface ProgramData {
  prog_id : string    // The hash identifier of the program
  method  : string    // The method called within the virtual machine.
  actions : string    // The machine instructions available to use.
  params  : Literal[] // A list of paramaters to configure the program.
  paths   : string    // The spending paths available to use.
}
```

## MachineConfig

The interface for initializing a virtual machine from a contract.

```ts
interface MachineConfig {
  active_at  : number          // UTC timestamp when the machine was activated.
  engine     : string          // The script interpreter to use for this machine.
  expires_at : number          // UTC deadline for when the machine must close.
  pathnames  : string[]        // The spending paths available in the contract.
  programs   : ProgramEntry[]  // A list of programs available to execute.
  schedule   : ScheduleEntry[] // A list of tasks scheduled to execute over time.
  vmid       : string          // The hash identifier to use for the machine.
}
```

## MachineData

The main data interface for a virtual machine instance.

```ts
interface MachineData {
  active_at  : number          // UTC timestamp when the machine was activated.
  commit_at  : number          // UTC timestamp of the latest commit to the machine.
  engine     : string          // The script interpreter in use for this machine.
  error      : string | null   // Error output of the VM.
  expires_at : number          // UTC deadline for when the machine must close.
  head       : string          // Current head of the commit-chain.
  output     : string | null   // Final output of the machine that decides spending.
  pathnames  : string[]        // The spending paths available in the contract.
  programs   : ProgramData[]   // A list of programs available to execute.
  state      : string          // A raw string value of the machine's internal state.
  step       : number          // The current execution count of the machine.
  tasks      : ScheduleEntry[] // A list of tasks scheduled to execute over time.
  updated_at : number          // UTC timestamp for when the machine was last updated.
  vmid       : string          // The hash identifier to use for the machine.
}
```

The `MachineData` interface is extended by state interfaces, each one describing a state-change:

```ts
interface MachineExecState {
  closed    : boolean        // Whether the machine has finished executing.
  closed_at : number | null  // UTC timestamp for when the machine closed.
}
```

## ScriptEngine API

The interface required for a script interpreter to plug into an escrow contract.

```ts
interface ScriptEngineAPI {
  label   : string   // Unique label/version of the interpreter.
  actions : string[] // A list of instructions available to use. 
  methods : string[] // A list of methods available to use.
  states  : string[] // A list of run states to expect from the machine.
  // Method for evaluating a stack of witness statements.
  eval    : (data   : VMData, witness  : WitnessData | WitnessData[]) => VMData
  // Method for creating a virtual machine instance.
  init    : (config : MachineConfig) => VMData
  // Method for running the machine up-to a specified timestamp.
  run     : (data   : VMData, stop_at ?: number) => VMData
  // Method for verifying the terms and paramaters of a program.
  verify  : (method : string, params   : Literal[]) => string | null
}
```
