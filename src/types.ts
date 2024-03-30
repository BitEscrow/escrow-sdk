import { DefaultPolicy } from './config/index.js'

export type Literal = string | number | boolean | null
export type Json    = Literal | { [key : string] : Json } | Json[]
export type Network = 'regtest' | 'main' | 'testnet' | 'signet' | 'mutiny'

export type ServerPolicy = typeof DefaultPolicy

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
