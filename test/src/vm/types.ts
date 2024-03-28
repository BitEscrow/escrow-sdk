export interface VMVector {
  title     : string
  members   : string[]
  pathnames : string[]
  programs  : (string | number)[][]
  schedule  : (string | number)[][]
  tests : {
    comment : string
    error   : string | null
    result  : string | null
    steps   : number
    stamp   : number
    witness : {
        action  : string
        method  : string
        path    : string
        signers : string[]
    }[]
  }[]
}
