# Witness Interfaces

List of interfaces for the Witness API. Click on the links below to navigate:

- [WitnessTemplate](#witnesstemplate)
- [WitnessData](#witnessdata)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## WitnessTemplate

```ts
interface WitnessTemplate {
  action : string
  args  ?: Literal[]
  method : string
  path   : string
  stamp ?: number
}
```

## WitnessData

```ts
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