export type Literal = string | number | boolean | null
export type Json    = Literal | { [key : string] : Json } | Json[]
export type Network = 'regtest' | 'main' | 'testnet' | 'signet'

export type Resolve<T = Json> = ResolveTrue<T> | ResolveFalse

interface ResolveTrue<T> {
  ok     : true
  data   : T
}

interface ResolveFalse {
  ok    : false
  error : string
}
