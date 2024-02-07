export type Literal = string | number | boolean | null
export type Json    = Literal | { [key : string] : Json } | Json[]
export type Network = 'regtest' | 'main' | 'testnet' | 'signet' | 'mutiny'

export interface SignedNote {
  content    : string
  created_at : number
  id         : string
  kind       : number
  pubkey     : string
  sig        : string
  tags       : string[][]
}
