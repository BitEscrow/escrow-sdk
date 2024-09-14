export type PathStateEntry = [
  path  : string,
  state : PathStateEnum
]

export enum PathStateEnum {
  open = 0,
  locked,
  disputed,
  spent
}
