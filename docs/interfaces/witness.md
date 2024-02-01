# Witness Interfaces

List of interfaces for the Witness API.

> Click on the links below to navigate:

- [WitnessTemplate](#witnesstemplate)  
- [WitnessData](#witnessdata)  

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