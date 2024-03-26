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
