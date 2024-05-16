export type Literal = string | number | boolean | null
export type Json    = Literal | { [key : string] : Json } | Json[]
export type Network = 'regtest' | 'main' | 'testnet' | 'signet' | 'mutiny'

export type ApiResponse<T> = DataResponse<T> | ErrorResponse

export interface DataResponse<T> {
  ok     : true
  data   : T
  error ?: string
  status : number
}

export interface ErrorResponse {
  ok     : false
  error  : string
  status : number
}

export interface ServerConfig {
  oracle_url : string
  server_pk  : string
  server_url : string
  network    : Network
}

export interface NoteTemplate {
  content    : string
  created_at : number
  kind       : number
  pubkey     : string
  tags       : string[][]
}

export interface SignedNote extends NoteTemplate {
  id  : string
  sig : string
}
