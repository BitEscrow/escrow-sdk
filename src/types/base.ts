export type Literal = string | number | boolean | null
export type Json    = Literal | { [key : string] : Json } | Json[]
export type Network = 'regtest' | 'main' | 'testnet' | 'signet' | 'mutiny'
